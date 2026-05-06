const { pool } = require('../models/db');

// Get all messages for a task
exports.getTaskMessages = async (req, res) => {
  try {
    const { taskId } = req.params;
    const result = await pool.query(`
      SELECT m.*, u.name as sender_name, u.email as sender_email
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.task_id = $1
      ORDER BY m.created_at ASC
    `, [taskId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all messages for a project
exports.getProjectMessages = async (req, res) => {
  try {
    const { projectId } = req.params;
    const result = await pool.query(`
      SELECT m.*, u.name as sender_name, u.email as sender_email
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.project_id = $1
      ORDER BY m.created_at ASC
    `, [projectId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a message for a task
exports.createTaskMessage = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { content, sender_id } = req.body;

    if (!content || !sender_id) {
      return res.status(400).json({ message: 'Content and sender_id are required' });
    }

    const userResult = await pool.query('SELECT name FROM users WHERE id = $1', [sender_id]);
    if (!userResult.rows.length) {
      return res.status(404).json({ message: 'User not found' });
    }

    const result = await pool.query(`
      INSERT INTO messages (content, sender_id, task_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [content, sender_id, taskId]);

    const message = result.rows[0];
    
    res.json({
      ...message,
      sender_name: userResult.rows[0].name
    });
  } catch (err) {
    console.error('Error creating message:', err);
    res.status(500).json({ message: err.message });
  }
};

// Create a message for a project
exports.createProjectMessage = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { content, sender_id } = req.body;

    if (!content || !sender_id) {
      return res.status(400).json({ message: 'Content and sender_id are required' });
    }

    const userResult = await pool.query('SELECT name FROM users WHERE id = $1', [sender_id]);
    if (!userResult.rows.length) {
      return res.status(404).json({ message: 'User not found' });
    }

    const result = await pool.query(`
      INSERT INTO messages (content, sender_id, project_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [content, sender_id, projectId]);

    const message = result.rows[0];
    
    res.json({
      ...message,
      sender_name: userResult.rows[0].name
    });
  } catch (err) {
    console.error('Error creating message:', err);
    res.status(500).json({ message: err.message });
  }
};

// Delete a message
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { user_id } = req.body;

    // Verify ownership
    const msgResult = await pool.query('SELECT sender_id FROM messages WHERE id = $1', [messageId]);
    if (!msgResult.rows[0] || msgResult.rows[0].sender_id !== user_id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await pool.query('DELETE FROM messages WHERE id = $1', [messageId]);
    res.json({ message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
