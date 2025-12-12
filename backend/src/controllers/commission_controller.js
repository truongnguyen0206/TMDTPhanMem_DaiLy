const CommissionService = require('../services/commission_service');

class CommissionController {
    // GET /api/commissions/my-report
    async getMyReport(req, res) {
        try {
            // Đảm bảo lấy ID người dùng từ Token và ép kiểu sang INT
            const userId = Number(req.user.user_id || req.user.id); 
            if (!userId || isNaN(userId)) {
                return res.status(401).json({ success: false, message: "Không tìm thấy User ID hợp lệ." });
            }

            const report = await CommissionService.getAgentReport(userId);
            res.status(200).json(report);
        } catch (error) {
            console.error("Error in getMyReport:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // GET /api/commissions/user/:id (Admin xem báo cáo của user khác)
    async getUserReport(req, res) {
        try {
            const userId = Number(req.params.id); // ID tham số phải là số nguyên
            
            if (isNaN(userId) || userId <= 0) {
                return res.status(400).json({ success: false, message: "ID người dùng không hợp lệ." });
            }

            const report = await CommissionService.getAgentReport(userId);
            res.status(200).json(report);
        } catch (error) {
            console.error("Error in getUserReport:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new CommissionController();