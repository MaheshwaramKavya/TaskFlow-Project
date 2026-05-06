const { pool } = require('../models/db');
const {
  sendTaskAssignmentEmail,
  sendStatusUpdateEmail
} = require('../services/emailService');
const vm = require('vm');

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });


exports.getAll = async (req, res) => {
  try {
    let query, params = [];
    const conditions = [];

    if (req.user.role !== 'admin') {
      conditions.push(`t.assignee_id = $${params.length + 1}`);
      params.push(req.user.id);
    }
    if (req.query.project_id) {
      conditions.push(`t.project_id = $${params.length + 1}`);
      params.push(req.query.project_id);
    }
    if (req.query.status) {
      conditions.push(`t.status = $${params.length + 1}`);
      params.push(req.query.status);
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    query = `
      SELECT t.*, u.name AS assignee_name, p.name AS project_name, p.color AS project_color
      FROM tasks t
      LEFT JOIN users u ON t.assignee_id = u.id
      LEFT JOIN projects p ON t.project_id = p.id
      ${where}
      ORDER BY t.created_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, description, status, priority, due_date, project_id, assignee_id, code, code_language } = req.body;
    if (!title) return res.status(400).json({ message: 'Title required' });

    const result = await pool.query(
      `INSERT INTO tasks (title, description, status, priority, due_date, project_id, assignee_id, created_by, code, code_language)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [title, description, status || 'pending', priority || 'medium', due_date || null,
       project_id || null, assignee_id || req.user.id, req.user.id, code || null, code_language || 'javascript']
    );

    const task = result.rows[0];

    // Send assignment email if assignee is different from creator
    if (assignee_id && assignee_id !== req.user.id) {
      try {
        const assigneeResult = await pool.query('SELECT email FROM users WHERE id = $1', [assignee_id]);
        const creatorResult = await pool.query('SELECT name FROM users WHERE id = $1', [req.user.id]);
        const projectResult = project_id ? await pool.query('SELECT name FROM projects WHERE id = $1', [project_id]) : null;

        if (assigneeResult.rows.length && creatorResult.rows.length) {
          await sendTaskAssignmentEmail({
            to: assigneeResult.rows[0].email,
            taskTitle: task.title,
            projectName: projectResult?.rows[0]?.name,
            assignedBy: creatorResult.rows[0].name,
          });
        }
      } catch (emailErr) {
        console.error('Failed to send task assignment email:', emailErr.message);
      }
    }

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, due_date, project_id, assignee_id, code, code_language } = req.body;

    // Get current task data for comparison
    const currentTask = await pool.query(`
      SELECT t.*, u.email AS assignee_email, p.name AS project_name
      FROM tasks t
      LEFT JOIN users u ON t.assignee_id = u.id
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.id = $1
    `, [id]);

    if (!currentTask.rows.length) return res.status(404).json({ message: 'Task not found' });

    // Members can only update status of their own tasks
    if (req.user.role !== 'admin') {
      if (currentTask.rows[0].assignee_id !== req.user.id)
        return res.status(403).json({ message: 'Not authorized' });
    }

    const result = await pool.query(
      `UPDATE tasks SET
        title=COALESCE($1,title), description=COALESCE($2,description),
        status=COALESCE($3,status), priority=COALESCE($4,priority),
        due_date=COALESCE($5,due_date), project_id=COALESCE($6,project_id),
        assignee_id=COALESCE($7,assignee_id), code=COALESCE($8,code),
        code_language=COALESCE($9,code_language), updated_at=NOW()
       WHERE id=$10 RETURNING *`,
      [title, description, status, priority, due_date, project_id, assignee_id, code, code_language, id]
    );

    const updatedTask = result.rows[0];

    // Send assignment email if assignee changed
    if (assignee_id && assignee_id !== currentTask.rows[0].assignee_id) {
      try {
        const assigneeResult = await pool.query('SELECT email FROM users WHERE id = $1', [assignee_id]);
        const updaterResult = await pool.query('SELECT name FROM users WHERE id = $1', [req.user.id]);
        const projectResult = updatedTask.project_id ? await pool.query('SELECT name FROM projects WHERE id = $1', [updatedTask.project_id]) : null;

        if (assigneeResult.rows.length && updaterResult.rows.length) {
          await sendTaskAssignmentEmail({
            to: assigneeResult.rows[0].email,
            taskTitle: updatedTask.title,
            projectName: projectResult?.rows[0]?.name,
            assignedBy: updaterResult.rows[0].name,
          });
        }
      } catch (emailErr) {
        console.error('Failed to send task assignment email:', emailErr.message);
      }
    }

    // Send status update email if status changed and there's an assignee
    if (status && status !== currentTask.rows[0].status && updatedTask.assignee_id) {
      try {
        const assigneeResult = await pool.query('SELECT email FROM users WHERE id = $1', [updatedTask.assignee_id]);
        const updaterResult = await pool.query('SELECT name FROM users WHERE id = $1', [req.user.id]);
        const projectResult = updatedTask.project_id ? await pool.query('SELECT name FROM projects WHERE id = $1', [updatedTask.project_id]) : null;

        if (assigneeResult.rows.length && updaterResult.rows.length) {
          await sendStatusUpdateEmail({
            to: assigneeResult.rows[0].email,
            taskTitle: updatedTask.title,
            oldStatus: currentTask.rows[0].status,
            newStatus: status,
            projectName: projectResult?.rows[0]?.name,
            updatedBy: updaterResult.rows[0].name,
          });
        }
      } catch (emailErr) {
        console.error('Failed to send status update email:', emailErr.message);
      }
    }

    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM tasks WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.executeCode = async (req, res) => {
  try {
    const { code, language } = req.body;
    if (!code) return res.status(400).json({ message: 'Code is required' });

    let output = '';
    let error = null;

    if (language === 'javascript') {
      try {
        // Create a safe context for code execution
        const context = {
          console: {
            log: (...args) => {
              output += args.map(arg =>
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
              ).join(' ') + '\n';
            },
            error: (...args) => {
              output += 'ERROR: ' + args.join(' ') + '\n';
            }
          },
          // Safe global functions
          setTimeout: () => { throw new Error('setTimeout not allowed'); },
          setInterval: () => { throw new Error('setInterval not allowed'); },
          require: () => { throw new Error('require not allowed'); },
          process: undefined,
          global: undefined,
          __dirname: undefined,
          __filename: undefined,
        };

        // Execute code in sandbox
        const script = new vm.Script(code);
        const result = script.runInNewContext(context, { timeout: 5000 });

        // If the code returns a value, add it to output
        if (result !== undefined) {
          output += '\nReturned: ' + (typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result));
        }

      } catch (execError) {
        error = execError.message;
      }
    } else {
      error = `Language '${language}' not supported. Only JavaScript is supported.`;
    }

    res.json({
      success: !error,
      output: output.trim(),
      error,
      language
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
