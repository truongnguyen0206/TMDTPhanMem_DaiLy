const express = require('express');
const router = express.Router();
const CommissionController = require('../../controllers/commission_controller');
const { authenticateToken } = require('../../middlewares/auth_middleware');

// 1. Xem báo cáo của chính mình (Agent/CTV)
router.get('/my-report', authenticateToken, CommissionController.getMyReport);

// 2. Admin xem báo cáo của user cụ thể
router.get('/user/:id', authenticateToken, CommissionController.getUserReport);

module.exports = router;