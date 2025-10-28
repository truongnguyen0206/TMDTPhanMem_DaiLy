const express = require('express');
const router = express.Router();
const withdrawalController = require('../../controllers/withdrawal_controller');
// Giả sử có một middleware để kiểm tra quyền Admin
const { authenticateToken, isAdmin } = require('../../middlewares/auth_middleware'); 

console.log('✅ Debug middlewares:');
console.log('authenticateToken:', typeof authenticateToken);
console.log('isAdmin:', typeof isAdmin);
console.log('controller.getPendingRequests:', typeof withdrawalController.getPendingRequests);


// POST /api/v1/withdrawals/request - User tạo yêu cầu (đã có)
router.post('/request', authenticateToken, withdrawalController.createWithdrawalRequest);

// --- API cho Admin ---
// GET /api/v1/withdrawals/pending - Lấy danh sách chờ duyệt
router.get('/pending', authenticateToken, isAdmin, withdrawalController.getPendingRequests);

// POST /api/v1/withdrawals/:requestId/process - Admin xử lý yêu cầu
router.post('/:requestId/process', authenticateToken, isAdmin, withdrawalController.processRequest);

module.exports = router;