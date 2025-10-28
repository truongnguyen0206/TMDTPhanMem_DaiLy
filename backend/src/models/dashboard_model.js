const supabase = require('../config/database_config');

// Lấy thông tin user cơ bản và role
const findUserAndRoleById = (userId) => {
    return supabase
        .from('users')
        .select('username, roles(role_name)')
        .eq('user_id', userId)
        .maybeSingle();
};

// Lấy số dư từ view user_balance
const findBalanceByUserId = (userId) => {
    return supabase
        .from('user_balance')
        .select('sodu_khadung')
        .eq('user_id', userId)
        .maybeSingle();
};

// Lấy thống kê hoa hồng tháng hiện tại
const findCurrentMonthCommission = (userId, month, year) => {
    return supabase
        .from('hoahong')
        .select('doanhso, tile, tienhoahong')
        .eq('user_id', userId)
        .eq('thang', month)
        .eq('nam', year)
        .maybeSingle();
};

// Lấy 5 đơn hàng gần nhất
const findRecentOrdersByUserId = (userId) => {
    return supabase
        .from('orders')
        .select('order_id, order_date, total_amount, status, products(product_name)')
        .eq('user_id', userId)
        .order('order_date', { ascending: false })
        .limit(5);
};

// Cập nhật hoạt động cho user (từ file Excel)
const updateUserActivities = (userId, activities) => {
    return supabase.from('users').update({ activities }).eq('user_id', userId);
};

// Lấy thống kê tổng quan từ view
const findStatisticsByUserId = (userId) => {
    return supabase
        .from('dashboard_overview')
        .select('*')
        .eq('user_id', userId)
        .single();
};

// Lấy top 3 sản phẩm của user
const findTopProductsByUserId = (userId) => {
     return supabase
        .from('orders')
        .select('product_id, products(product_name), SUM(quantity) as total_quantity, SUM(total_amount) as total_revenue')
        .eq('user_id', userId)
        .order('total_quantity', { ascending: false })
        .limit(3)
        .group('product_id, products.product_name');
};

// Tạo một yêu cầu rút tiền mới
const createWithdrawalRequest = (requestData) => {
    return supabase
        .from('withdraw_requests')
        .insert([requestData])
        .select()
        .single();
};

module.exports = {
    findUserAndRoleById,
    findBalanceByUserId,
    findCurrentMonthCommission,
    findRecentOrdersByUserId,
    updateUserActivities,
    findStatisticsByUserId,
    findTopProductsByUserId,
    createWithdrawalRequest,
};