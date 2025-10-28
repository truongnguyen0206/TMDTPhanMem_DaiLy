const fs = require('fs');
const xlsx = require('xlsx');
const DashboardModel = require('../models/dashboard_model'); // <--- Import Model

/**
 * Lấy dữ liệu tổng hợp cho Dashboard cá nhân.
 * Service này sẽ gọi nhiều hàm model và tổng hợp kết quả.
 */
const getPersonalData = async (userId) => {
    try {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        // Gọi đồng thời các hàm từ Model để tăng hiệu suất
        const [
            { data: user, error: userError },
            { data: balance, error: balanceError },
            { data: monthlyStats, error: statsError },
            { data: recentOrders, error: ordersError },
        ] = await Promise.all([
            DashboardModel.findUserAndRoleById(userId),
            DashboardModel.findBalanceByUserId(userId),
            DashboardModel.findCurrentMonthCommission(userId, currentMonth, currentYear),
            DashboardModel.findRecentOrdersByUserId(userId),
        ]);

        if (userError) throw userError;
        if (balanceError) throw balanceError;
        if (statsError) throw statsError;
        if (ordersError) throw ordersError;
        
        if (!user) return { userInfo: null, financial: null, currentStats: null, recentOrders: [] };
        
        // Logic tổng hợp và định dạng dữ liệu nằm ở Service
        return {
            userInfo: {
                username: user.username,
                role: user.roles?.role_name || 'N/A',
            },
            financial: balance || { tong_hoahong: 0, tong_ruttien: 0, sodu_khadung: 0 },
            currentStats: monthlyStats || { doanhso: 0, tile: 0, tienhoahong: 0 },
            recentOrders: recentOrders || [],
        };
    } catch (error) {
        throw new Error(`Failed to get personal dashboard data: ${error.message}`);
    }
};

/**
 * Xử lý file Excel upload.
 */
const processExcelUpload = async (filePath, userId) => {
    try {
        // Logic đọc file vẫn nằm ở Service
        const workbook = xlsx.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);
        const activities = data.map(row => row.Activity || 'Unknown activity');

        // Gọi Model để cập nhật DB
        const { error } = await DashboardModel.updateUserActivities(userId, activities);
        if (error) throw error;
        
    } catch (error) {
        throw new Error(`File processing error: ${error.message}`);
    } finally {
        fs.unlinkSync(filePath);
    }
};

/**
 * Lấy các thống kê tổng quan.
 */
const getStatistics = async (userId) => {
    const { data, error } = await DashboardModel.findStatisticsByUserId(userId);
    if (error) throw new Error(`Failed to get statistics: ${error.message}`);
    return data;
};

/**
 * Lấy danh sách sản phẩm bán chạy.
 */
const getProductsSummary = async (userId) => {
    const { data, error } = await DashboardModel.findTopProductsByUserId(userId);
    if (error) throw new Error(`Failed to get products summary: ${error.message}`);
    return { topProducts: data || [] };
};

/**
 * Gửi yêu cầu rút tiền (Ví dụ điển hình của logic nghiệp vụ).
 */
const submitWithdrawalRequest = async (userId, amount) => {
    // 1. Logic nghiệp vụ: Kiểm tra các điều kiện
    if (amount < 1000000) {
        throw new Error('Số tiền rút tối thiểu phải là 1,000,000 VND.');
    }

    // 2. Gọi Model để lấy dữ liệu cần thiết
    const { data: balance, error: balanceError } = await DashboardModel.findBalanceByUserId(userId);
    if (balanceError) throw balanceError;
    const availableBalance = balance?.sodu_khadung || 0;

    // 3. Logic nghiệp vụ: So sánh, tính toán
    if (amount > availableBalance) {
        throw new Error(`Số dư khả dụng (${availableBalance} VND) không đủ để rút ${amount} VND.`);
    }

    // 4. Gọi Model để ghi dữ liệu
    const requestData = {
        user_id: userId,
        amount: amount,
        status: 'Pending',
    };
    const { data, error } = await DashboardModel.createWithdrawalRequest(requestData);
    if (error) throw error;
    
    return data;
};

module.exports = {
    getPersonalData,
    processExcelUpload,
    getStatistics,
    getProductsSummary,
    submitWithdrawalRequest,
};