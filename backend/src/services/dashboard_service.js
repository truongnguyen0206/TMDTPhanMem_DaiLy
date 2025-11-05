const supabase = require('../config/supabaseClient');
const xlsx = require('xlsx');
const fs = require('fs');
const UserModel = require('../models/user_model'); // Nếu dùng model, nếu không thì dùng trực tiếp supabase

/**
 * Lấy dữ liệu tổng hợp cho Dashboard cá nhân.
 * Sử dụng các VIEWS và logic đã thiết kế trong DB.
 */
const getPersonalData = async (userId) => {
    try {
        // 1. Lấy thông tin cơ bản và role
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('username, role_id, roles(role_name)')
            .eq('user_id', userId)
            .maybeSingle(); // maybeSingle để xử lý trường hợp không tìm thấy user
        
        if (userError) throw userError;
        if (!user) return { userInfo: null, financial: null, currentStats: null, recentOrders: [] };

        // 2. Lấy số dư hoa hồng từ user_balance VIEW
        const { data: balance, error: balanceError } = await supabase
            .from('user_balance')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();
        if (balanceError) throw balanceError;

        // 3. Lấy thống kê doanh số/hoa hồng tháng hiện tại từ hoahong table
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const { data: monthlyStats, error: statsError } = await supabase
            .from('hoahong')
            .select('doanhso, tile, tienhoahong')
            .eq('user_id', userId)
            .eq('thang', currentMonth)
            .eq('nam', currentYear)
            .maybeSingle();
        if (statsError) throw statsError;

        // 4. Lấy 5 đơn hàng gần nhất (chỉ cần các trường cơ bản)
        const { data: recentOrders, error: ordersError } = await supabase
            .from('orders')
            .select('order_id, order_date, total_amount, status, products(product_name)')
            .eq('user_id', userId)
            .order('order_date', { ascending: false })
            .limit(5);
        if (ordersError) throw ordersError;

        // Tổng hợp và trả về
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
 * Xử lý file Excel upload và cập nhật hoạt động cho user.
 */
const processExcelUpload = async (filePath, userId) => {
    try {
        const workbook = xlsx.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);

        const activities = data.map(row => row.Activity || 'Unknown activity');

        // Sử dụng logic trực tiếp với Supabase hoặc Model
        // Giả sử chỉ dùng Supabase để đơn giản hóa:
        const { error } = await supabase.from('users').update({ activities }).eq('user_id', userId);
        if (error) throw error;
        
    } catch (error) {
        // Tùy chọn, bạn có thể custom error type để controller dễ dàng xử lý (như đã thấy ở dashboard.controller.js)
        throw new Error(`File processing error: ${error.message}`);
    } finally {
        // DÙ THÀNH CÔNG HAY THẤT BẠI, PHẢI XÓA FILE TẠM!
        fs.unlinkSync(filePath);
    }
};

/**
 * Lấy các thống kê tổng quan (total orders, total sales, etc.)
 * Sửa lại để dùng Dashboard Overview VIEW.
 */
const getStatistics = async (userId) => {
    try {
        // Sử dụng dashboard_overview VIEW để lấy thống kê đã được tính sẵn
        const { data, error } = await supabase
            .from('dashboard_overview')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) throw error;
        return data; // Trả về object chứa total_orders, total_sales, total_commission...

    } catch (error) {
        throw new Error(`Failed to get statistics: ${error.message}`);
    }
};

/**
 * Lấy danh sách sản phẩm bán chạy/tóm tắt sản phẩm. (Thiếu trong code gốc)
 */
const getProductsSummary = async (userId) => {
    try {
        // Sử dụng top_products VIEW hoặc tính toán top 3 sản phẩm theo user
        const { data, error } = await supabase
            .from('orders')
            .select('product_id, products(product_name), SUM(quantity) as total_quantity, SUM(total_amount) as total_revenue')
            .eq('user_id', userId)
            .order('total_quantity', { ascending: false })
            .limit(3)
            .group('product_id, products.product_name');
            
        if (error) throw error;

        return {
            topProducts: data || []
        };
    } catch (error) {
        throw new Error(`Failed to get products summary: ${error.message}`);
    }
};

/**
 * Gửi yêu cầu rút tiền. <--- BỔ SUNG HÀM NÀY
 * @param {string} userId - ID của người dùng.
 * @param {number} amount - Số tiền muốn rút.
 */
const submitWithdrawalRequest = async (userId, amount) => {
    try {
        // 1. Kiểm tra số dư khả dụng từ View user_balance
        const { data: balance, error: balanceError } = await supabase
            .from('user_balance')
            .select('sodu_khadung') 
            .eq('user_id', userId)
            .maybeSingle(); 
        
        if (balanceError) throw balanceError;

        const availableBalance = balance?.sodu_khadung || 0;

        // Kiểm tra số dư khả dụng
        if (amount > availableBalance) {
            throw new Error(`Số dư khả dụng (${availableBalance} VND) không đủ để rút ${amount} VND.`);
        }
        
        // Kiểm tra mức tối thiểu (đã có ở middleware nhưng thêm ở đây để đảm bảo)
        if (amount < 1000000) {
             throw new Error('Số tiền rút tối thiểu phải là 1,000,000 VND.');
        }

        // 2. Tạo yêu cầu rút tiền mới
        const { data, error } = await supabase
            .from('withdraw_requests') // Tên bảng theo schema
            .insert([
                {
                    user_id: userId,
                    amount: amount,
                    status: 'Pending', // Trạng thái mặc định
                },
            ])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        // Ném lỗi với thông báo chi tiết hơn để controller xử lý 400
        throw new Error(`File processing error: ${error.message}`);
    }
};


// SỬA LỖI EXPORT CRITICAL: Export tất cả các hàm cần thiết
module.exports = {
    getPersonalData,
    processExcelUpload,
    getStatistics, 
    getProductsSummary,
    submitWithdrawalRequest, // Bổ sung hàm bị thiếu
};