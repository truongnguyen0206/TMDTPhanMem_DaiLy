const dashboardService = require('../services/dashboard_service');

/**
 * Lấy dữ liệu tổng hợp cho dashboard cá nhân.
 */
const getPersonalDashboard = async (req, res) => {
    try {
        // Lấy userId từ middleware xác thực đã chạy trước đó
        const userId = req.user.id; 
        
        const data = await dashboardService.getPersonalData(userId);
        res.status(200).json({ success: true, data });
    } catch (err) {
        console.error('Error in getPersonalDashboard:', err.message);
        res.status(500).json({ success: false, error: 'Failed to retrieve personal dashboard data' });
    }
};

/**
 * Xử lý yêu cầu tải lên file Excel.
 */
const uploadExcel = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Middleware (multer, validator) đã xử lý việc file có tồn tại hay không
        // Nếu qua được middleware, req.file chắc chắn sẽ tồn tại
        await dashboardService.processExcelUpload(req.file.path, userId);
        res.status(200).json({ success: true, message: 'File uploaded and processed successfully' });
    } catch (err) {
        console.error('Error in uploadExcel:', err.message);
        res.status(500).json({ success: false, error: 'Failed to process uploaded file' });
    }
};

/**
 * Lấy các số liệu thống kê tổng quan.
 */
const getStatistics = async (req, res) => {
    try {
        const userId = req.user.id;
        const data = await dashboardService.getStatistics(userId);
        res.status(200).json({ success: true, data });
    } catch (err) {
        console.error('Error in getStatistics:', err.message);
        res.status(500).json({ success: false, error: 'Failed to retrieve statistics' });
    }
};

/**
 * Lấy tóm tắt về các sản phẩm bán chạy.
 */
const getProductsSummary = async (req, res) => {
    try {
        const userId = req.user.id;
        const data = await dashboardService.getProductsSummary(userId);
        res.status(200).json({ success: true, data });
    } catch (err) {
        console.error('Error in getProductsSummary:', err.message);
        res.status(500).json({ success: false, error: 'Failed to retrieve product summary' });
    }
};

/**
 * Xử lý yêu cầu rút tiền.
 */
const requestWithdrawal = async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount } = req.body;

        // Validate đầu vào cơ bản
        if (!amount || typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({ success: false, error: 'Invalid amount provided.' });
        }

        const data = await dashboardService.submitWithdrawalRequest(userId, amount);
        res.status(201).json({ success: true, message: 'Withdrawal request submitted successfully.', data });
    } catch (err) {
        console.error('Error in requestWithdrawal:', err.message);
        // Phân biệt lỗi nghiệp vụ (do người dùng) và lỗi hệ thống
        if (err.message.includes('Số dư') || err.message.includes('tối thiểu')) {
            return res.status(400).json({ success: false, error: err.message });
        }
        res.status(500).json({ success: false, error: 'Failed to submit withdrawal request' });
    }
};


module.exports = {
    getPersonalDashboard,
    uploadExcel,
    getStatistics,
    getProductsSummary,
    requestWithdrawal, // Đừng quên export hàm mới
};