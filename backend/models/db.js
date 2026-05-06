const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin','member')),
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      description TEXT,
      color VARCHAR(20) DEFAULT '#6366f1',
      owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS project_members (
      project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      PRIMARY KEY (project_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending','in-progress','completed')),
      priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('high','medium','low')),
      due_date DATE,
      project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
      assignee_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      code TEXT,
      code_language VARCHAR(20) DEFAULT 'javascript',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS signup_otps (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      otp_hash VARCHAR(255) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      attempts INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS email_reminders (
      id SERIAL PRIMARY KEY,
      task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
      reminder_key VARCHAR(80) NOT NULL,
      sent_at TIMESTAMP DEFAULT NOW(),
      UNIQUE (task_id, reminder_key)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      content TEXT NOT NULL,
      sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
      project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS user_profiles (
      id SERIAL PRIMARY KEY,
      user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      bio TEXT,
      avatar_url VARCHAR(255),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('✅ Database tables ready');
};

module.exports = { pool, initDB };
