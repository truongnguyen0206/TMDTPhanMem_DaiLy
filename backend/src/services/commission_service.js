const CommissionModel = require('../models/commission_model');

class CommissionService {
    /**
     * Lấy báo cáo tài chính cho User (Agent/CTV)
     * @param {number} userId - ID người dùng (INT).
     */
    async getAgentReport(userId) {
        try {
            // 1. Lấy danh sách hoa hồng chi tiết từ Model
            const detailedRecords = await CommissionModel.getRecordsByRecipient(userId);
            // 2. Lấy số dư hiện tại
            const balanceInfo = await CommissionModel.getBalance(userId);

            return {
                success: true,
                data: {
                    balance: balanceInfo.sodu_khadung,
                    total_earned: balanceInfo.tong_hoahong,
                    total_withdrawn: balanceInfo.tong_ruttien,
                    history: detailedRecords // Trả về lịch sử chi tiết
                }
            };
        } catch (error) {
            console.error("Service Error:", error);
            throw error;
        }
    }
}

module.exports = new CommissionService();