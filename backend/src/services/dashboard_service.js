const supabase = require('../config/database_config');
const xlsx = require('xlsx');
const fs = require('fs');
const UserModel = require('../models/user_model'); // Nếu dùng model, nếu không thì dùng trực tiếp supabase
const OrderModel = require('../models/order_model');// Mới thêm để lấy thống kê Admin (An làm)

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

//========================================
//Làm thêm phần lấy thông kê tổng quan cho Admin Dashboard ( an almf)
//========================================
// 🆕 Hàm helper: Tính số thứ tự tuần trong năm (ISO Week Date)
// Tính tuần
const getStartAndEndOfWeek = (date) => {
    const day = date.getDay(); 
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); 
    const start = new Date(date);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
};

// Chuẩn hóa chuỗi
const normalize = (str) => str ? str.toLowerCase().trim() : '';

// Tính % tăng trưởng
const calculateGrowth = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
};

// Lấy range ngày của tháng
const getMonthRange = (year, month) => {
    const start = new Date(Date.UTC(year, month, 1));
    const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
    return { start: start.toISOString(), end: end.toISOString() };
};

// Xử lý dữ liệu biểu đồ
const processChartData = (targetArray, rawOrdersYear, indexResolver, dateFilter = null) => {
    if (rawOrdersYear && rawOrdersYear.length > 0) {
        rawOrdersYear.forEach(order => {
            if (order.tao_vao_luc) {
                const date = new Date(order.tao_vao_luc);
                
                if (dateFilter && (date < dateFilter.start || date > dateFilter.end)) {
                    return;
                }

                const idx = indexResolver(date);
                const status = normalize(order.trang_thai_don_hang); 

                if (idx >= 0 && idx < targetArray.length) {
                    if (status === 'hoàn thành' || status === 'đã hoàn thành' || status === 'đã giao' || status === 'thành công' || status === 'đã xác nhận') {
                        targetArray[idx].Approved += 1;
                    } else if (status === 'đã hủy' || status === 'hủy' || status === 'cancelled' || status === 'đã hoàn') {
                        targetArray[idx].Cancelled += 1;
                    }
                }
            }
        });
    }
};

// --- MAIN ADMIN FUNCTION ---

const getAdminOrderStats = async (groupBy = 'year') => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); 

    // Chuẩn bị khoảng thời gian cho so sánh tháng
    const thisMonthRange = getMonthRange(currentYear, currentMonth);
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthRange = getMonthRange(lastMonthDate.getFullYear(), lastMonthDate.getMonth());

    // 🔥 GỌI TẤT CẢ CÁC QUERY CẦN THIẾT (CHO CẢ OrdersPage VÀ DashboardPage)
    const [
      // 1. Dữ liệu cho OrdersPage (Các thẻ thống kê cũ)
      agentOrders,      // Đơn qua Đại lý
      pendingPayment,   // Đơn chờ thanh toán
      ctvOrders,        // Đơn qua CTV
      nppOrders,        // Đơn qua NPP
      returnedOrders,   // Đơn bị hoàn/hủy
      totalRevenue,     // Tổng doanh thu
      pendingOrdersCount, // Đơn chờ xử lý

      // 2. Dữ liệu cho DashboardPage (Biểu đồ & Top Partner)
      rawTopPartners,   // Dữ liệu tính Top
      rawOrdersYear,    // Dữ liệu vẽ Chart

      // 3. Dữ liệu cho DashboardPage (So sánh tăng trưởng)
      ordersThisMonth,
      ordersLastMonth,
      pendingAccountsCount,
    ] = await Promise.all([
      OrderModel.countOrders({ source: 'Đại lý' }), 
      OrderModel.countOrders({ payment_status: 'Chờ thanh toán' }), 
      OrderModel.countOrders({ source: 'Cộng tác viên' }), 
      OrderModel.countOrders({ source: 'Nhà phân phối' }),
      OrderModel.countOrders({ status: 'Đã hủy' }), 
      OrderModel.getTotalRevenue(),
      OrderModel.countOrders({ status: 'Chờ xử lý' }),
      
      OrderModel.getOrdersForTopPartners(),
      OrderModel.getOrdersByYear(currentYear),
      
      OrderModel.listOrders({ from: thisMonthRange.start, to: thisMonthRange.end, limit: 10000 }),
      OrderModel.listOrders({ from: lastMonthRange.start, to: lastMonthRange.end, limit: 10000 }),
      UserModel.countPendingUsers(),  
      UserModel.countUsersByDateRange(thisMonthRange.start, thisMonthRange.end),
      UserModel.countUsersByDateRange(lastMonthRange.start, lastMonthRange.end)
    ]);

    // --- XỬ LÝ LOGIC CHO DASHBOARD PAGE ---

    // 1. Tính toán thẻ Thống kê (Stats Cards - Có Growth)
    const totalOrdersThisMonth = ordersThisMonth.length;
    const totalOrdersLastMonth = ordersLastMonth.length;
    const revenueThisMonth = ordersThisMonth.reduce((sum, o) => sum + (Number(o.tong_tien) || 0), 0);
    const revenueLastMonth = ordersLastMonth.reduce((sum, o) => sum + (Number(o.tong_tien) || 0), 0);

    const stats_cards = {
        total_orders: { 
            value: totalOrdersThisMonth, 
            growth: calculateGrowth(totalOrdersThisMonth, totalOrdersLastMonth) 
        },
        total_revenue: { 
            value: revenueThisMonth, 
            growth: calculateGrowth(revenueThisMonth, revenueLastMonth) 
        },
        pending_orders: { 
            value: pendingOrdersCount 
        },
        new_customers: { 
            value: pendingAccountsCount,
            growth: null
        }
    };

    // 2. Xử lý Top Đối Tác
    const partnerMap = {};
    rawTopPartners.forEach(order => {
        const name = order.nguoi_tao_don;
        const amount = Number(order.tong_tien) || 0;
        if (name) {
            if (!partnerMap[name]) partnerMap[name] = { name, orders: 0, revenue: 0 };
            partnerMap[name].orders += 1;
            partnerMap[name].revenue += amount;
        }
    });
    const topPartners = Object.values(partnerMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    // 3. Xử lý Biểu đồ
    let chartData = [];
    if (groupBy === 'week') {
        const { start, end } = getStartAndEndOfWeek(new Date());
        const daysOfWeek = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
        chartData = daysOfWeek.map(day => ({ name: day, Approved: 0, Cancelled: 0 }));
        processChartData(chartData, rawOrdersYear, (date) => {
            let dayIndex = date.getDay(); 
            return dayIndex === 0 ? 6 : dayIndex - 1; 
        }, { start, end });
    } else {
        chartData = Array.from({ length: 12 }, (_, i) => ({ name: `T${i + 1}`, Approved: 0, Cancelled: 0 }));
        processChartData(chartData, rawOrdersYear, (date) => date.getMonth());
    }

    // --- TRẢ VỀ KẾT QUẢ ---
    return {
      // Dữ liệu cho DashboardPage (Mới)
      stats_cards,
      top_partners: topPartners,
      monthly_stats: chartData,

      // Dữ liệu cho OrdersPage (Cũ - Đã thêm lại)
      via_agent: agentOrders,
      pending_payment: pendingPayment,
      via_ctv: ctvOrders,
      via_npp: nppOrders,
      returned: returnedOrders,
      total_revenue: totalRevenue,
      pending_orders: pendingOrdersCount
    };

  } catch (error) {
    console.error("❌ Service Error:", error);
    throw new Error(`Lỗi khi lấy thống kê Admin: ${error.message}`);
  }
};

module.exports = {
    getPersonalData,
    processExcelUpload,
    getStatistics, 
    getProductsSummary,
    submitWithdrawalRequest,
    getAdminOrderStats 
};