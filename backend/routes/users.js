const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/userController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.put('/:id', ctrl.update);
router.delete('/:id', requireAdmin, ctrl.delete);

module.exports = router;
