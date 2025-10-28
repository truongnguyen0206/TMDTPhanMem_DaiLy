const db = require('../config/database_config'); // Import trực tiếp db client để dùng transaction
const WithdrawalModel = require('../models/withdrawal_model');
const UserModel = require('../models/user_model');

/**
 * Lấy danh sách các yêu cầu đang chờ duyệt.
 */
const getPendingRequests = async () => {
    const { data, error } = await WithdrawalModel.findAllPending();
    if (error) throw error;
    return data;
};

/**
 * Xử lý nghiệp vụ duyệt hoặc từ chối yêu cầu rút tiền.
 * Đây là nơi triển khai Database Transaction.
 * @param {string} requestId - ID của yêu cầu.
 * @param {string} adminId - ID của admin xử lý.
 * @param {string} action - 'approve' hoặc 'reject'.
 * @param {string} [reason] - Lý do từ chối.
 */
const processRequest = async (requestId, adminId, action, reason) => {
    // Sử dụng transaction của supabase-js
    const { data, error } = await db.rpc('process_withdrawal', {
        p_request_id: requestId,
        p_admin_id: adminId,
        p_action: action,
        p_reason: reason
    });

    if (error) {
        // Nếu lỗi là do nghiệp vụ (ví dụ: số dư không đủ), ném lỗi cụ thể
        if (error.message.includes('Số dư không đủ')) {
            throw new Error(error.message);
        }
        // Lỗi hệ thống khác
        throw new Error('Lỗi hệ thống khi xử lý yêu cầu.');
    }

    return data;
};


module.exports = {
    getPendingRequests,
    processRequest,
    // submitRequest đã có từ trước
};