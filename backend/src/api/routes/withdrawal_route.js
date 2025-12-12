const express = require('express');
const router = express.Router();

// Sử dụng Destructuring để lấy trực tiếp hàm requestWithdrawal.
// Điều này giúp dễ dàng xác định lỗi nếu hàm bị undefined.
const { requestWithdrawal } = require('../../controllers/withdrawal_controller'); 
const { authenticateToken } = require('../../middlewares/auth_middleware');
const { validateWithdrawalRequest } = require('../../middlewares/validator_middleware');

// POST /api/withdrawals - Gửi yêu cầu rút tiền
router.post(
    '/request', 
    authenticateToken, 
    validateWithdrawalRequest, 
    requestWithdrawal // Sử dụng trực tiếp tên hàm đã được Destructure
);


module.exports = router;