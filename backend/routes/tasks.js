const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/taskController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate);
router.get('/', ctrl.getAll);
router.post('/', ctrl.create);           // members can create tasks
router.post('/execute-code', ctrl.executeCode);  // place before /:id to avoid conflicts
router.put('/:id', ctrl.update);          // members can update their own tasks
router.delete('/:id', requireAdmin, ctrl.remove);

module.exports = router;
