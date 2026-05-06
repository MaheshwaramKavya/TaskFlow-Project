const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/projectController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate);
router.get('/', ctrl.getAll);
router.post('/', ctrl.create);           // members can create projects
router.put('/:id', requireAdmin, ctrl.update);
router.delete('/:id', requireAdmin, ctrl.remove);

module.exports = router;
