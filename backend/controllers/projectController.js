const { pool } = require('../models/db');
const { sendProjectUpdateEmail } = require('../services/emailService');

exports.getAll = async (req, res) => {
  try {
    let query, params;
    if (req.user.role === 'admin') {
      query = `
        SELECT p.*, u.name AS owner_name,
               COUNT(DISTINCT pm.user_id) AS member_count,
               ARRAY_AGG(DISTINCT pm.user_id) FILTER (WHERE pm.user_id IS NOT NULL) AS member_ids
        FROM projects p
        LEFT JOIN users u ON p.owner_id = u.id
        LEFT JOIN project_members pm ON p.id = pm.project_id
        GROUP BY p.id, u.name ORDER BY p.created_at DESC`;
      params = [];
    } else {
      query = `
        SELECT p.*, u.name AS owner_name,
               COUNT(DISTINCT pm2.user_id) AS member_count,
               ARRAY_AGG(DISTINCT pm2.user_id) FILTER (WHERE pm2.user_id IS NOT NULL) AS member_ids
        FROM projects p
        JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = $1
        LEFT JOIN users u ON p.owner_id = u.id
        LEFT JOIN project_members pm2 ON p.id = pm2.project_id
        GROUP BY p.id, u.name ORDER BY p.created_at DESC`;
      params = [req.user.id];
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, description, color, member_ids = [] } = req.body;
    if (!name) return res.status(400).json({ message: 'Project name required' });

    const result = await pool.query(
      'INSERT INTO projects (name, description, color, owner_id) VALUES ($1,$2,$3,$4) RETURNING *',
      [name, description, color || '#6366f1', req.user.id]
    );
    const project = result.rows[0];

    const ids = [...new Set([req.user.id, ...member_ids])];
    for (const uid of ids) {
      await pool.query('INSERT INTO project_members (project_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [project.id, uid]);
    }

    // Send project creation notification to all members
    try {
      const creatorResult = await pool.query('SELECT name FROM users WHERE id = $1', [req.user.id]);
      const membersResult = await pool.query(`
        SELECT u.email FROM users u
        JOIN project_members pm ON u.id = pm.user_id
        WHERE pm.project_id = $1 AND u.id != $2
      `, [project.id, req.user.id]);

      const creatorName = creatorResult.rows[0]?.name || 'Unknown';
      const details = `New project created with ${ids.length} member${ids.length !== 1 ? 's' : ''}`;

      for (const member of membersResult.rows) {
        await sendProjectUpdateEmail({
          to: member.email,
          projectName: project.name,
          updateType: 'Project Created',
          details,
          updatedBy: creatorName,
        });
      }
    } catch (emailErr) {
      console.error('Failed to send project creation emails:', emailErr.message);
    }

    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color, member_ids } = req.body;

    // Get current project data
    const currentProject = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    if (!currentProject.rows.length) return res.status(404).json({ message: 'Project not found' });

    const result = await pool.query(
      'UPDATE projects SET name=COALESCE($1,name), description=COALESCE($2,description), color=COALESCE($3,color) WHERE id=$4 RETURNING *',
      [name, description, color, id]
    );

    const updatedProject = result.rows[0];

    if (member_ids) {
      await pool.query('DELETE FROM project_members WHERE project_id=$1', [id]);
      for (const uid of member_ids) {
        await pool.query('INSERT INTO project_members (project_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [id, uid]);
      }
    }

    // Send project update notification if something changed
    const hasChanges = name || description || color || member_ids;
    if (hasChanges) {
      try {
        const updaterResult = await pool.query('SELECT name FROM users WHERE id = $1', [req.user.id]);
        const membersResult = await pool.query(`
          SELECT u.email FROM users u
          JOIN project_members pm ON u.id = pm.user_id
          WHERE pm.project_id = $1 AND u.id != $2
        `, [id, req.user.id]);

        const updaterName = updaterResult.rows[0]?.name || 'Unknown';
        let updateType = 'Project Updated';
        let details = 'Project details have been modified';

        if (name && name !== currentProject.rows[0].name) {
          updateType = 'Project Renamed';
          details = `Project renamed from "${currentProject.rows[0].name}" to "${name}"`;
        } else if (member_ids) {
          updateType = 'Members Updated';
          details = `Project membership has been updated`;
        }

        for (const member of membersResult.rows) {
          await sendProjectUpdateEmail({
            to: member.email,
            projectName: updatedProject.name,
            updateType,
            details,
            updatedBy: updaterName,
          });
        }
      } catch (emailErr) {
        console.error('Failed to send project update emails:', emailErr.message);
      }
    }

    res.json(updatedProject);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM projects WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
