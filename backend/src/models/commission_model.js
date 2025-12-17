// src/models/commission_model.js

const supabase = require('../config/supabaseClient');

class CommissionModel {
    /**
     * 1. Lấy lịch sử hoa hồng CHI TIẾT từ VIEW đã join sẵn.
     * @param {number} userId - ID người dùng (INT).
     */
    static async getRecordsByRecipient(userId) {
        // TRUY VẤN TRỰC TIẾP VIEW ĐÃ JOIN
        const { data, error } = await supabase
            .schema('transactions')
            .from('commission_records_view') // <-- ĐÃ SỬA THÀNH TÊN VIEW MỚI
            .select('*') // Lấy tất cả các cột đã JOIN
            .eq('recipient_user_id', userId) 
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data || [];
    }

    /**
     * 2. Lấy số dư khả dụng (Giữ nguyên)
     */
    static async getBalance(userId) {
        // ... (Logic này vẫn ổn vì nó truy vấn View user_balance) ...
        const { data, error } = await supabase
            .from('user_balance')
            .select('sodu_khadung, tong_hoahong, tong_ruttien')
            .eq('user_id', userId)
            .maybeSingle();

        if (error) throw new Error(error.message);
        return data || { sodu_khadung: 0, tong_hoahong: 0, tong_ruttien: 0 };
    }
}

module.exports = CommissionModel;