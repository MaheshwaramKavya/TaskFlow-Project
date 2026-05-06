const { pool } = require('../models/db');
const {
  sendDeadlineReminderEmail,
  sendOverdueAlertEmail,
  sendDailySummaryEmail
} = require('./emailService');

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const sendDueSoonReminders = async () => {
  const daysAhead = Number(process.env.REMINDER_DAYS_AHEAD || 1);
  const reminderKey = `${daysAhead}-day`;

  const result = await pool.query(
    `
      SELECT t.id, t.title, t.due_date, u.email, p.name AS project_name
      FROM tasks t
      JOIN users u ON u.id = t.assignee_id
      LEFT JOIN projects p ON p.id = t.project_id
      LEFT JOIN email_reminders er ON er.task_id = t.id AND er.reminder_key = $1
      WHERE t.status <> 'completed'
        AND t.due_date IS NOT NULL
        AND t.due_date = (CURRENT_DATE + ($2::int * INTERVAL '1 day'))::date
        AND er.id IS NULL
    `,
    [reminderKey, daysAhead]
  );

  for (const task of result.rows) {
    await sendDeadlineReminderEmail({
      to: task.email,
      taskTitle: task.title,
      projectName: task.project_name,
      dueDate: formatDate(task.due_date),
      daysLeft: daysAhead,
    });
    await pool.query(
      'INSERT INTO email_reminders (task_id, reminder_key) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [task.id, reminderKey]
    );
  }

  if (result.rows.length) {
    console.log(`Sent ${result.rows.length} deadline reminder email(s)`);
  }
};

const sendOverdueAlerts = async () => {
  const daysOverdueThreshold = Number(process.env.OVERDUE_ALERT_DAYS || 1);
  const alertKey = `overdue-${daysOverdueThreshold}`;

  const result = await pool.query(
    `
      SELECT t.id, t.title, t.due_date, u.email, p.name AS project_name,
             (CURRENT_DATE - t.due_date) as days_overdue
      FROM tasks t
      JOIN users u ON u.id = t.assignee_id
      LEFT JOIN projects p ON p.id = t.project_id
      LEFT JOIN email_reminders er ON er.task_id = t.id AND er.reminder_key = $1
      WHERE t.status <> 'completed'
        AND t.due_date IS NOT NULL
        AND t.due_date < CURRENT_DATE
        AND (CURRENT_DATE - t.due_date) >= $2
        AND er.id IS NULL
    `,
    [alertKey, daysOverdueThreshold]
  );

  for (const task of result.rows) {
    await sendOverdueAlertEmail({
      to: task.email,
      taskTitle: task.title,
      projectName: task.project_name,
      dueDate: formatDate(task.due_date),
      daysOverdue: task.days_overdue,
    });
    await pool.query(
      'INSERT INTO email_reminders (task_id, reminder_key) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [task.id, alertKey]
    );
  }

  if (result.rows.length) {
    console.log(`Sent ${result.rows.length} overdue alert email(s)`);
  }
};

const sendDailySummaries = async () => {
  const summaryKey = `daily-summary-${new Date().toISOString().split('T')[0]}`;

  // Skip if already sent today
  const existing = await pool.query(
    'SELECT id FROM email_reminders WHERE reminder_key = $1 LIMIT 1',
    [summaryKey]
  );
  if (existing.rows.length > 0) return;

  const users = await pool.query(`
    SELECT u.id, u.name, u.email
    FROM users u
    WHERE EXISTS (
      SELECT 1 FROM tasks t WHERE t.assignee_id = u.id AND t.status <> 'completed'
    )
  `);

  for (const user of users.rows) {
    const stats = await pool.query(`
      SELECT
        COUNT(CASE WHEN status = 'completed' AND updated_at::date = CURRENT_DATE THEN 1 END) as completed_today,
        COUNT(CASE WHEN status <> 'completed' THEN 1 END) as pending,
        COUNT(CASE WHEN status <> 'completed' AND due_date < CURRENT_DATE THEN 1 END) as overdue
      FROM tasks
      WHERE assignee_id = $1
    `, [user.id]);

    const upcoming = await pool.query(`
      SELECT title, due_date
      FROM tasks
      WHERE assignee_id = $1 AND status <> 'completed' AND due_date IS NOT NULL
        AND due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days'
      ORDER BY due_date
      LIMIT 5
    `, [user.id]);

    const upcomingDeadlines = upcoming.rows.map(task =>
      `${task.title} (${formatDate(task.due_date)})`
    );

    await sendDailySummaryEmail({
      to: user.email,
      userName: user.name.split(' ')[0],
      tasksCompleted: parseInt(stats.rows[0].completed_today),
      tasksPending: parseInt(stats.rows[0].pending),
      tasksOverdue: parseInt(stats.rows[0].overdue),
      upcomingDeadlines,
    });
  }

  // Mark as sent
  await pool.query(
    'INSERT INTO email_reminders (task_id, reminder_key) VALUES (NULL, $1)',
    [summaryKey]
  );

  if (users.rows.length) {
    console.log(`Sent ${users.rows.length} daily summary email(s)`);
  }
};

const startReminderService = () => {
  if (process.env.ENABLE_EMAIL_REMINDERS === 'false') return;

  const intervalMinutes = Number(process.env.REMINDER_INTERVAL_MINUTES || 60);

  // Initial run
  sendDueSoonReminders().catch(err => console.error('Deadline reminder check failed:', err.message));
  sendOverdueAlerts().catch(err => console.error('Overdue alert check failed:', err.message));
  sendDailySummaries().catch(err => console.error('Daily summary check failed:', err.message));

  // Schedule recurring checks
  setInterval(() => {
    sendDueSoonReminders().catch(err => console.error('Deadline reminder check failed:', err.message));
    sendOverdueAlerts().catch(err => console.error('Overdue alert check failed:', err.message));
  }, intervalMinutes * 60 * 1000);

  // Daily summaries at 9 AM
  const now = new Date();
  const nineAM = new Date(now);
  nineAM.setHours(9, 0, 0, 0);
  const timeUntilNineAM = nineAM > now ? nineAM - now : (24 * 60 * 60 * 1000) - (now - nineAM);

  setTimeout(() => {
    sendDailySummaries().catch(err => console.error('Daily summary check failed:', err.message));
    setInterval(() => {
      sendDailySummaries().catch(err => console.error('Daily summary check failed:', err.message));
    }, 24 * 60 * 60 * 1000); // Every 24 hours
  }, timeUntilNineAM);
};

module.exports = {
  sendDueSoonReminders,
  sendOverdueAlerts,
  sendDailySummaries,
  startReminderService
};
