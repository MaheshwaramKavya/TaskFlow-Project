require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDB } = require('./models/db');
const { startReminderService } = require('./services/reminderService');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/users', require('./routes/users'));
app.use('/api', require('./routes/messages'));

app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date() }));

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

initDB()
  .then(() => {
    startReminderService();
    app.listen(PORT, () => console.log(`TaskFlow API running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Failed to initialize database:', err.message);
    process.exit(1);
  });
