const { pool } = require('../models/db');

exports.getAll = async (req, res) => {
  try {
    // Only admins can see email addresses
    const fields = req.user.role === 'admin' 
      ? 'id, name, email, role, created_at' 
      : 'id, name, role, created_at';
    const result = await pool.query(`SELECT ${fields} FROM users ORDER BY created_at DESC`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT u.id, u.name, u.email, u.role, u.created_at, up.bio, up.avatar_url
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = $1
    `, [id]);
    if (!result.rows.length) return res.status(404).json({ message: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, bio, avatar_url } = req.body;
    
    // Users can only update their own profile, admins can update anyone
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const userResult = await pool.query(
      'UPDATE users SET name=COALESCE($1,name), email=COALESCE($2,email) WHERE id=$3 RETURNING id, name, email, role, created_at',
      [name, email, id]
    );
    if (!userResult.rows.length) return res.status(404).json({ message: 'User not found' });

    await pool.query(`
      INSERT INTO user_profiles (user_id, bio, avatar_url)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id) DO UPDATE SET
        bio = $2,
        avatar_url = $3,
        updated_at = NOW()
    `, [id, bio || null, avatar_url || null]);

    const updatedResult = await pool.query(`
      SELECT u.id, u.name, u.email, u.role, u.created_at, up.bio, up.avatar_url
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = $1
    `, [id]);

    res.json(updatedResult.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Only admins can delete users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    if (!result.rows.length) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
