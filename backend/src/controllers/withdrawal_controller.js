// File: withdrawal.controller.js
const dashboardService = require('../services/dashboard_service'); 
const db = require('../config/supabaseClient');

/**
 * API: Lấy danh sách ngân hàng (Để hiển thị Dropdown)
 */
const getBanks = async (req, res) => {
    try {
        const banks = await dashboardService.getBankList();
        res.status(200).json({ success: true, data: banks });
    } catch (err) {
        res.status(500).json({ error: 'Không lấy được danh sách ngân hàng' });
    }
};

/**
 * API: Xử lý yêu cầu rút tiền
 */
const requestWithdrawal = async (req, res) => {
    try {
        const userId = req.user.id; 
        
        // --- CẬP NHẬT: Nhận thêm thông tin ngân hàng từ req.body ---
        const { amount, bankId, accountNumber, accountHolder } = req.body; 

        if (!userId) {
             return res.status(401).json({ error: 'Unauthorized: User ID not found' });
        }
        
        // Kiểm tra dữ liệu đầu vào cơ bản
        if (!bankId || !accountNumber || !accountHolder) {
            return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin ngân hàng' });
        }

        // --- CẬP NHẬT: Truyền đủ tham số sang Service ---
        const data = await dashboardService.submitWithdrawalRequest(
            userId, 
            amount, 
            Number(bankId), 
            accountNumber, 
            accountHolder
        );
        
        res.status(201).json({ 
            success: true, 
            message: 'Yêu cầu rút tiền đã được gửi thành công. Đang chờ Admin xử lý.',
            data
        });
    } catch (err) {
        console.error('Error in requestWithdrawal:', err.message);
        
        if (err.message.includes('Số dư khả dụng không đủ') || err.message.includes('tối thiểu') || err.message.includes('Ngân hàng')|| err.message.includes('Failed to process withdrawal request')) {
            return res.status(400).json({ error: 'Invalid Request', details: err.message });
        }
        
        res.status(500).json({ error: 'Failed to process withdrawal request', details: err.message });
    }
};

module.exports = {
    requestWithdrawal,
    getBanks // Xuất thêm hàm này để Route gọi
};