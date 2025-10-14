// backend/src/api/services/dashboard.service.js

const { supabase } = require('../../config/supabaseClient');

/**
 * Xử lý logic nghiệp vụ cho việc tạo yêu cầu rút tiền.
 * 1. Kiểm tra số dư khả dụng của user từ view `user_balance`.
 * 2. So sánh với số tiền yêu cầu rút.
 * 3. Nếu hợp lệ, tạo một bản ghi mới trong `withdraw_requests`.
 * * @param {number} userId - ID của người dùng yêu cầu rút tiền.
 * @param {number} amount - Số tiền muốn rút.
 * @returns {Promise<object>} - Dữ liệu của yêu cầu vừa được tạo.
 * @throws {Error} - Ném lỗi nếu số dư không đủ hoặc có lỗi DB.
 */
const submitWithdrawalRequest = async (userId, amount) => {
    // B1: Lấy số dư khả dụng hiện tại của người dùng từ view
    const { data: balanceData, error: balanceError } = await supabase
        .from('user_balance')
        .select('sodu_khadung')
        .eq('user_id', userId)
        .single();

    if (balanceError) {
        console.error('Lỗi khi truy vấn số dư:', balanceError.message);
        throw new Error('Không thể kiểm tra số dư của bạn. Vui lòng thử lại sau.');
    }

    if (!balanceData) {
        throw new Error('Không tìm thấy thông tin số dư của người dùng.');
    }

    const availableBalance = balanceData.sodu_khadung;

    // B2: Kiểm tra xem số dư có đủ để rút không
    if (availableBalance < amount) {
        // Định dạng số cho dễ đọc
        const formattedBalance = new Intl.NumberFormat('vi-VN').format(availableBalance);
        throw new Error(`Số dư khả dụng không đủ. Số dư của bạn là ${formattedBalance} VND.`);
    }

    // B3: Nếu số dư đủ, tạo yêu cầu rút tiền mới
    const { data: newRequest, error: insertError } = await supabase
        .from('withdraw_requests')
        .insert({
            user_id: userId,
            amount: amount,
            status: 'Pending' // Trạng thái mặc định khi user tạo
        })
        .select()
        .single(); // Lấy lại bản ghi vừa tạo để trả về

    if (insertError) {
        console.error('Lỗi khi tạo yêu cầu rút tiền:', insertError.message);
        throw new Error('Đã xảy ra lỗi khi tạo yêu cầu rút tiền của bạn.');
    }

    return newRequest;
};


module.exports = {
    submitWithdrawalRequest,
    // ... các hàm service khác cho dashboard có thể được thêm vào đây
};