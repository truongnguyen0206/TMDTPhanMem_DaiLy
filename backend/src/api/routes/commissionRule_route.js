const express = require('express');
const router = express.Router();
const CommissionRuleController = require('../../controllers/commissionRule_controller');
const { authenticateToken } = require('../../middlewares/auth_middleware');

// // Áp dụng xác thực & phân quyền
// router.use(authMiddleware.authenticateToken);
// router.use(authMiddleware.requireRole(['Admin']));

// Các route API
router.get('/', authenticateToken, CommissionRuleController.getAllRules);
router.get('/:id', authenticateToken, CommissionRuleController.getRuleById);
router.post('/', authenticateToken, CommissionRuleController.createRule);
router.put('/:id', authenticateToken, CommissionRuleController.updateRule);
router.delete('/:id', authenticateToken, CommissionRuleController.deleteRule);

module.exports = router;