const withdrawalService = require('../services/withdrawal_service')

/**
 * Xử lý HTTP request để tạo yêu cầu rút tiền (từ User).
 */
const createWithdrawalRequest = async (req, res) => {
    try {
        const userId = req.user.id; // Lấy từ middleware xác thực
        const { amount } = req.body;

        // Validate đầu vào
        if (!amount || typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({ success: false, error: 'Số tiền không hợp lệ.' });
        }

        const newRequest = await withdrawalService.submitRequest(userId, amount);
        res.status(201).json({ success: true, message: 'Yêu cầu rút tiền đã được gửi thành công.', data: newRequest });

    } catch (err) {
        console.error('Error in createWithdrawalRequest:', err.message);
        
        // Phân biệt lỗi do người dùng (400) và lỗi hệ thống (500)
        if (err.message.includes('Số dư') || err.message.includes('tối thiểu')) {
            return res.status(400).json({ success: false, error: err.message });
        }
        
        res.status(500).json({ success: false, error: 'Không thể xử lý yêu cầu rút tiền.' });
    }
};

/**
 * Lấy danh sách các yêu cầu đang chờ duyệt cho Admin.
 */
const getPendingRequests = async (req, res) => {
    try {
        const requests = await withdrawalService.getPendingRequests();
        res.status(200).json({ success: true, data: requests });
    } catch (err) {
        console.error('Error in getPendingRequests:', err.message);
        res.status(500).json({ success: false, error: 'Không thể lấy danh sách yêu cầu.' });
    }
};

/**
 * Xử lý yêu cầu duyệt / từ chối từ Admin.
 */
const processRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { action, reason } = req.body; // action: 'approve' hoặc 'reject'
        const adminId = req.user.id; // Lấy từ middleware xác thực

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ success: false, error: 'Hành động không hợp lệ.' });
        }
        if (action === 'reject' && !reason) {
            return res.status(400).json({ success: false, error: 'Vui lòng cung cấp lý do từ chối.' });
        }

        await withdrawalService.processRequest(requestId, adminId, action, reason);

        const message = action === 'approve' ? 'Phê duyệt yêu cầu thành công.' : 'Từ chối yêu cầu thành công.';
        res.status(200).json({ success: true, message });

    } catch (err) {
        console.error('Error in processRequest:', err.message);
        // Lỗi nghiệp vụ do service trả về
        if (err.message.includes('Số dư không đủ') || err.message.includes('đã được xử lý')) {
             return res.status(400).json({ success: false, error: err.message });
        }
        // Lỗi hệ thống
        res.status(500).json({ success: false, error: 'Không thể xử lý yêu cầu.' });
    }
};

module.exports = {
    createWithdrawalRequest,
    getPendingRequests, // ✅ THÊM HÀM BỊ THIẾU VÀO ĐÂY
    processRequest,
};