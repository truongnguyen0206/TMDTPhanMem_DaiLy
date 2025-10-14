// File: withdrawal.route.js (Đã Sửa Lỗi)

const express = require('express');
const router = express.Router();

// Sử dụng Destructuring để lấy trực tiếp hàm requestWithdrawal.
// Điều này giúp dễ dàng xác định lỗi nếu hàm bị undefined.
const { requestWithdrawal } = require('../../controllers/withdrawal.controller'); 
const { authenticateToken } = require('../../middlewares/auth.middleware');
const { validateWithdrawalRequest } = require('../../middlewares/validator.middleware');

// POST /api/withdrawals - Gửi yêu cầu rút tiền
router.post(
    '/', 
    authenticateToken, 
    validateWithdrawalRequest, 
    requestWithdrawal // Sử dụng trực tiếp tên hàm đã được Destructure
);

module.exports = router;