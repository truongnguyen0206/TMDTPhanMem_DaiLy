// File: withdrawal.controller.js
const dashboardService = require('../services/dashboard_service'); 

/**
 * Xử lý yêu cầu rút tiền từ người dùng.
 * Gọi submitWithdrawalRequest trong service.
 */
const requestWithdrawal = async (req, res) => {
    try {
        // Lấy userId từ req.user do authenticateToken middleware cung cấp
        const userId = req.user.id; 
        const { amount } = req.body; 

        if (!userId) {
             return res.status(401).json({ error: 'Unauthorized: User ID not found' });
        }

        const data = await dashboardService.submitWithdrawalRequest(userId, amount);
        
        res.status(201).json({ 
            success: true, 
            message: 'Yêu cầu rút tiền đã được gửi thành công. Đang chờ Admin xử lý.',
            data
        });
    } catch (err) {
        console.error('Error in requestWithdrawal:', err.message);
        
        // Xử lý lỗi số dư không đủ hoặc tối thiểu từ Service
        if (err.message.includes('Số dư khả dụng không đủ') || err.message.includes('tối thiểu')) {
            return res.status(400).json({ error: 'Invalid Request', details: err.message });
        }
        
        res.status(500).json({ error: 'Failed to process withdrawal request', details: err.message });
    }
};

module.exports = {
    requestWithdrawal,
};