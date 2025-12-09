const supabase = require('../config/database_config');

/**
 * Lấy danh sách tất cả các yêu cầu đang chờ duyệt.
 */
const findAllPending = () => {
    return supabase
        .from('withdraw_requests')
        .select(`
            request_id,
            created_at,
            amount,
            status,
            users ( user_id, username, email )
        `)
        .eq('status', 'Pending');
};

/**
 * Tìm một yêu cầu rút tiền theo ID.
 * @param {string} requestId - ID của yêu cầu.
 * @param {object} [tx] - Transaction client (tùy chọn).
 */
const findById = (requestId, tx) => {
    const queryBuilder = tx || supabase; // Dùng transaction client nếu có
    return queryBuilder
        .from('withdraw_requests')
        .select('*')
        .eq('request_id', requestId)
        .single();
};

/**
 * Cập nhật trạng thái và lý do của một yêu cầu.
 * @param {string} requestId - ID của yêu cầu.
 * @param {string} status - Trạng thái mới ('Approved' hoặc 'Rejected').
 * @param {string} reason - Lý do từ chối (nếu có).
 * @param {object} [tx] - Transaction client (tùy chọn).
 */
const updateStatus = (requestId, status, reason, tx) => {
    const queryBuilder = tx || supabase;
    return queryBuilder
        .from('withdraw_requests')
        .update({ status: status, rejection_reason: reason, processed_at: new Date() })
        .eq('request_id', requestId);
};

module.exports = {
    findAllPending,
    findById,
    updateStatus,
    // Hàm create đã có từ trước
};