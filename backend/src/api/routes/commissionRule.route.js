// 

const express = require('express');
const router = express.Router();
const CommissionRuleController = require('../../controllers/commissionRule.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

// Áp dụng xác thực & phân quyền
router.use(authMiddleware.authenticateToken);
router.use(authMiddleware.requireRole(['Admin']));

// Các route API
router.get('/', CommissionRuleController.getAllRules);
router.post('/', CommissionRuleController.createRule);
router.put('/:id', CommissionRuleController.updateRule);
router.delete('/:id', CommissionRuleController.deleteRule);

module.exports = router;
