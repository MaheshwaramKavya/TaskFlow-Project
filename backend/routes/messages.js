const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/messageController');

// Messages endpoints
router.get('/tasks/:taskId/messages', ctrl.getTaskMessages);
router.post('/tasks/:taskId/messages', ctrl.createTaskMessage);
router.get('/projects/:projectId/messages', ctrl.getProjectMessages);
router.post('/projects/:projectId/messages', ctrl.createProjectMessage);
router.delete('/messages/:messageId', ctrl.deleteMessage);

module.exports = router;
