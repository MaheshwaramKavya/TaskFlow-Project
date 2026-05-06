const nodemailer = require('nodemailer');

let cachedTransporter;

const hasSmtpConfig = () =>
  process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS;

const getTransporter = () => {
  if (cachedTransporter) return cachedTransporter;

  if (!hasSmtpConfig()) return null;

  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return cachedTransporter;
};

const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = getTransporter();
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER || 'TaskFlow <no-reply@taskflow.local>';

  if (!transporter) {
    console.log('\n--- TaskFlow email preview ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(text);
    console.log('--- end email preview ---\n');
    return { preview: true };
  }

  return transporter.sendMail({ from, to, subject, text, html });
};

const sendOtpEmail = (email, otp) => sendEmail({
  to: email,
  subject: 'Your TaskFlow verification code',
  text: `Your TaskFlow verification code is ${otp}. It expires in 10 minutes.`,
  html: `
    <div style="font-family:Arial,sans-serif;background:#050505;color:#f5f2eb;padding:24px">
      <h2 style="color:#ff7a1a">Verify your TaskFlow account</h2>
      <p>Your one-time verification code is:</p>
      <div style="font-size:32px;font-weight:800;letter-spacing:6px;color:#ff7a1a">${otp}</div>
      <p>This code expires in 10 minutes.</p>
    </div>
  `,
});

// Welcome Email for Account Creation
const sendWelcomeEmail = ({ to, userName }) => sendEmail({
  to,
  subject: 'Welcome to TaskFlow – Your Task Management Journey Begins!',
  text: `Welcome ${userName}! Your TaskFlow account has been created successfully. Start managing your projects and tasks efficiently.`,
  html: `
    <div style="font-family:Arial,sans-serif;background:#050505;color:#f5f2eb;padding:24px;max-width:600px;margin:0 auto">
      <div style="text-align:center;margin-bottom:24px">
        <div style="font-size:48px;margin-bottom:16px">🎉</div>
        <h1 style="color:#69e6ff;margin:0;font-size:28px">Welcome to TaskFlow!</h1>
        <p style="color:#a9b0d4;margin:8px 0 0 0">Your account has been created successfully</p>
      </div>
      <div style="background:#0a0a1a;padding:24px;border-radius:12px;border:1px solid #7b5cff;margin-bottom:20px">
        <h2 style="color:#f6fbff;margin:0 0 12px 0">Hello ${userName}!</h2>
        <p style="color:#a9b0d4;margin:0 0 16px 0">Welcome to TaskFlow, your powerful task management platform. You're now ready to:</p>
        <ul style="color:#a9b0d4;margin:0 0 16px 0;padding-left:20px">
          <li>Create and organize projects</li>
          <li>Assign tasks to team members</li>
          <li>Track deadlines and progress</li>
          <li>Receive automated reminders</li>
          <li>Generate daily task reports</li>
        </ul>
        <p style="color:#f6fbff;margin:0"><strong>Get started by logging in and creating your first project!</strong></p>
      </div>
      <p style="color:#f5f2eb;text-align:center">Happy task managing!</p>
    </div>
  `,
});

// Task Assignment Email
const sendTaskAssignmentEmail = ({ to, taskTitle, projectName, assignedBy }) => sendEmail({
  to,
  subject: 'You have been assigned a new task',
  text: `You have been assigned a new task: "${taskTitle}"${projectName ? ` in project "${projectName}"` : ''}. Assigned by: ${assignedBy}`,
  html: `
    <div style="font-family:Arial,sans-serif;background:#050505;color:#f5f2eb;padding:24px;max-width:600px;margin:0 auto">
      <div style="text-align:center;margin-bottom:24px">
        <div style="font-size:48px;margin-bottom:16px">📋</div>
        <h1 style="color:#69e6ff;margin:0;font-size:28px">New Task Assignment</h1>
      </div>
      <div style="background:#0a0a1a;padding:24px;border-radius:12px;border:1px solid #7b5cff;margin-bottom:20px">
        <h2 style="color:#ff7a1a;margin:0 0 12px 0">${taskTitle}</h2>
        ${projectName ? `<p style="color:#a9b0d4;margin:0 0 16px 0"><strong>Project:</strong> ${projectName}</p>` : ''}
        <p style="color:#a9b0d4;margin:0"><strong>Assigned by:</strong> ${assignedBy}</p>
      </div>
      <p style="color:#f5f2eb;text-align:center">Log in to TaskFlow to view task details and get started.</p>
    </div>
  `,
});

// Deadline Reminder
const sendDeadlineReminderEmail = ({ to, taskTitle, projectName, dueDate, daysLeft }) => sendEmail({
  to,
  subject: 'Your task deadline is approaching',
  text: `Reminder: "${taskTitle}"${projectName ? ` in ${projectName}` : ''} is due on ${dueDate} (${daysLeft} days left).`,
  html: `
    <div style="font-family:Arial,sans-serif;background:#050505;color:#f5f2eb;padding:24px;max-width:600px;margin:0 auto">
      <div style="text-align:center;margin-bottom:24px">
        <div style="font-size:48px;margin-bottom:16px">⏰</div>
        <h1 style="color:#ff7a1a;margin:0;font-size:28px">Deadline Reminder</h1>
      </div>
      <div style="background:#0a0a1a;padding:24px;border-radius:12px;border:1px solid #ff7a1a;margin-bottom:20px">
        <h2 style="color:#f6fbff;margin:0 0 12px 0">${taskTitle}</h2>
        ${projectName ? `<p style="color:#a9b0d4;margin:0 0 16px 0"><strong>Project:</strong> ${projectName}</p>` : ''}
        <p style="color:#f6fbff;margin:0 0 8px 0"><strong>Due Date:</strong> ${dueDate}</p>
        <p style="color:#ff7a1a;margin:0;font-weight:800">${daysLeft} days left</p>
      </div>
      <p style="color:#f5f2eb;text-align:center">Don't forget to complete this task on time!</p>
    </div>
  `,
});

// Overdue Alert
const sendOverdueAlertEmail = ({ to, taskTitle, projectName, dueDate, daysOverdue }) => sendEmail({
  to,
  subject: 'Task is overdue – take action',
  text: `ALERT: "${taskTitle}"${projectName ? ` in ${projectName}` : ''} was due on ${dueDate} and is now ${daysOverdue} days overdue.`,
  html: `
    <div style="font-family:Arial,sans-serif;background:#050505;color:#f5f2eb;padding:24px;max-width:600px;margin:0 auto">
      <div style="text-align:center;margin-bottom:24px">
        <div style="font-size:48px;margin-bottom:16px">🚨</div>
        <h1 style="color:#ff5f87;margin:0;font-size:28px">Overdue Task Alert</h1>
      </div>
      <div style="background:#0a0a1a;padding:24px;border-radius:12px;border:1px solid #ff5f87;margin-bottom:20px">
        <h2 style="color:#f6fbff;margin:0 0 12px 0">${taskTitle}</h2>
        ${projectName ? `<p style="color:#a9b0d4;margin:0 0 16px 0"><strong>Project:</strong> ${projectName}</p>` : ''}
        <p style="color:#f6fbff;margin:0 0 8px 0"><strong>Due Date:</strong> ${dueDate}</p>
        <p style="color:#ff5f87;margin:0;font-weight:800">${daysOverdue} days overdue</p>
      </div>
      <p style="color:#f5f2eb;text-align:center">Please update the task status or contact your project manager.</p>
    </div>
  `,
});

// Status Update Notification
const sendStatusUpdateEmail = ({ to, taskTitle, projectName, oldStatus, newStatus, updatedBy }) => sendEmail({
  to,
  subject: 'Task status updated',
  text: `Task "${taskTitle}"${projectName ? ` in ${projectName}` : ''} status changed from "${oldStatus}" to "${newStatus}" by ${updatedBy}.`,
  html: `
    <div style="font-family:Arial,sans-serif;background:#050505;color:#f5f2eb;padding:24px;max-width:600px;margin:0 auto">
      <div style="text-align:center;margin-bottom:24px">
        <div style="font-size:48px;margin-bottom:16px">📊</div>
        <h1 style="color:#42f59b;margin:0;font-size:28px">Task Status Updated</h1>
      </div>
      <div style="background:#0a0a1a;padding:24px;border-radius:12px;border:1px solid #42f59b;margin-bottom:20px">
        <h2 style="color:#f6fbff;margin:0 0 12px 0">${taskTitle}</h2>
        ${projectName ? `<p style="color:#a9b0d4;margin:0 0 16px 0"><strong>Project:</strong> ${projectName}</p>` : ''}
        <p style="color:#f6fbff;margin:0 0 8px 0"><strong>Status changed:</strong> ${oldStatus} → ${newStatus}</p>
        <p style="color:#a9b0d4;margin:0"><strong>Updated by:</strong> ${updatedBy}</p>
      </div>
      <p style="color:#f5f2eb;text-align:center">Check TaskFlow for more details.</p>
    </div>
  `,
});

// Daily Summary Email
const sendDailySummaryEmail = ({ to, userName, tasksCompleted, tasksPending, tasksOverdue, upcomingDeadlines }) => sendEmail({
  to,
  subject: 'Your daily task report',
  text: `Good day ${userName}! Today you completed ${tasksCompleted} tasks. You have ${tasksPending} pending and ${tasksOverdue} overdue tasks. ${upcomingDeadlines.length ? `Upcoming deadlines: ${upcomingDeadlines.join(', ')}` : ''}`,
  html: `
    <div style="font-family:Arial,sans-serif;background:#050505;color:#f5f2eb;padding:24px;max-width:600px;margin:0 auto">
      <div style="text-align:center;margin-bottom:24px">
        <div style="font-size:48px;margin-bottom:16px">📈</div>
        <h1 style="color:#69e6ff;margin:0;font-size:28px">Daily Task Report</h1>
        <p style="color:#a9b0d4;margin:8px 0 0 0">Good day, ${userName}!</p>
      </div>
      <div style="background:#0a0a1a;padding:24px;border-radius:12px;border:1px solid #7b5cff;margin-bottom:20px">
        <div style="display:flex;justify-content:space-around;text-align:center;margin-bottom:20px">
          <div>
            <div style="font-size:32px;font-weight:800;color:#42f59b">${tasksCompleted}</div>
            <div style="color:#a9b0d4;font-size:12px">Completed</div>
          </div>
          <div>
            <div style="font-size:32px;font-weight:800;color:#ffc857">${tasksPending}</div>
            <div style="color:#a9b0d4;font-size:12px">Pending</div>
          </div>
          <div>
            <div style="font-size:32px;font-weight:800;color:#ff5f87">${tasksOverdue}</div>
            <div style="color:#a9b0d4;font-size:12px">Overdue</div>
          </div>
        </div>
        ${upcomingDeadlines.length ? `
          <h3 style="color:#f6fbff;margin:20px 0 12px 0">Upcoming Deadlines</h3>
          <ul style="color:#a9b0d4;margin:0;padding-left:20px">
            ${upcomingDeadlines.map(task => `<li>${task}</li>`).join('')}
          </ul>
        ` : ''}
      </div>
      <p style="color:#f5f2eb;text-align:center">Keep up the great work!</p>
    </div>
  `,
});

// Project Update Email
const sendProjectUpdateEmail = ({ to, projectName, updateType, details, updatedBy }) => sendEmail({
  to,
  subject: `Project update: ${projectName}`,
  text: `Project "${projectName}" has been updated: ${updateType}. ${details} Updated by: ${updatedBy}`,
  html: `
    <div style="font-family:Arial,sans-serif;background:#050505;color:#f5f2eb;padding:24px;max-width:600px;margin:0 auto">
      <div style="text-align:center;margin-bottom:24px">
        <div style="font-size:48px;margin-bottom:16px">📁</div>
        <h1 style="color:#7b5cff;margin:0;font-size:28px">Project Update</h1>
      </div>
      <div style="background:#0a0a1a;padding:24px;border-radius:12px;border:1px solid #7b5cff;margin-bottom:20px">
        <h2 style="color:#f6fbff;margin:0 0 12px 0">${projectName}</h2>
        <p style="color:#ff7a1a;margin:0 0 16px 0;font-weight:800">${updateType}</p>
        <p style="color:#a9b0d4;margin:0 0 16px 0">${details}</p>
        <p style="color:#a9b0d4;margin:0"><strong>Updated by:</strong> ${updatedBy}</p>
      </div>
      <p style="color:#f5f2eb;text-align:center">Check TaskFlow for the latest project details.</p>
    </div>
  `,
});

const sendReminderEmail = ({ to, taskTitle, projectName, dueDate }) => sendEmail({
  to,
  subject: `Task reminder: ${taskTitle}`,
  text: `Reminder: "${taskTitle}"${projectName ? ` in ${projectName}` : ''} is due on ${dueDate}.`,
  html: `
    <div style="font-family:Arial,sans-serif;background:#050505;color:#f5f2eb;padding:24px">
      <h2 style="color:#ff7a1a">Task reminder</h2>
      <p><strong>${taskTitle}</strong>${projectName ? ` in ${projectName}` : ''} is due on <strong>${dueDate}</strong>.</p>
    </div>
  `,
});

module.exports = {
  sendOtpEmail,
  sendWelcomeEmail,
  sendTaskAssignmentEmail,
  sendDeadlineReminderEmail,
  sendOverdueAlertEmail,
  sendStatusUpdateEmail,
  sendDailySummaryEmail,
  sendProjectUpdateEmail,
  sendReminderEmail
};
