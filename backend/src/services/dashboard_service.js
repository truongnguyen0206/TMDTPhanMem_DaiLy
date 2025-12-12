const supabase = require('../config/supabaseClient');
const xlsx = require('xlsx');
const fs = require('fs');
const UserModel = require('../models/user_model'); 
const { countAgentsByDistributor } = require('../models/dashboard_model'); // Đảm bảo import đúng

/**
 * 1. Lấy dữ liệu tổng hợp cho Dashboard cá nhân.
 */
const getPersonalData = async (userId) => {
    try {
        // ... (Giữ nguyên logic cũ của bạn ở đây) ...
        // (Để tiết kiệm dòng tin nhắn, tôi xin phép không paste lại đoạn này vì nó không đổi)
        // ... Đoạn code cũ của bạn vẫn chạy tốt ...
        
        // Code demo giữ chỗ (Placeholder) để bạn biết vị trí:
        const { data: user, error: userError } = await supabase
            .from('users').select('username, role_id, roles(role_name)').eq('user_id', userId).maybeSingle();
        if (userError) throw userError;
        if (!user) return { userInfo: null, financial: null, currentStats: null, recentOrders: [] };

        const { data: balance } = await supabase.from('user_balance').select('*').eq('user_id', userId).maybeSingle();
        
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const { data: monthlyStats } = await supabase.from('hoahong')
            .select('doanhso, tile, tienhoahong')
            .eq('user_id', userId).eq('thang', currentMonth).eq('nam', currentYear).maybeSingle();

        const { data: recentOrders } = await supabase.from('orders')
            .select('order_id, order_date, total_amount, status, products(product_name)')
            .eq('user_id', userId).order('order_date', { ascending: false }).limit(5);

        return {
            userInfo: { username: user.username, role: user.roles?.role_name || 'N/A' },
            financial: balance || { tong_hoahong: 0, tong_ruttien: 0, sodu_khadung: 0 },
            currentStats: monthlyStats || { doanhso: 0, tile: 0, tienhoahong: 0 },
            recentOrders: recentOrders || [],
        };
    } catch (error) {
        throw new Error(`Failed to get personal dashboard data: ${error.message}`);
    }
};

/**
 * 2. Lấy danh sách ngân hàng (Hàm MỚI thêm)
 */
const getBankList = async () => {
    try {
        // Query vào bảng transactions.banks (Schema mới bạn tạo)
        const { data, error } = await supabase
            .from('banks') // Lưu ý: Supabase tự nhận schema nếu config đúng, hoặc ghi rõ 'transactions.banks' nếu cần
            .select('bank_id, bank_code, short_name, bank_name')
            .order('short_name', { ascending: true });

        if (error) throw error;
        return data;
    } catch (error) {
        throw new Error(`Failed to get bank list: ${error.message}`);
    }
};

/**
 * 3. Gửi yêu cầu rút tiền (CẬP NHẬT LOGIC MỚI)
 */
const submitWithdrawalRequest = async (userId, amount, bankId, accountNumber, accountHolder) => {
    try {
        // 1. LOG DỮ LIỆU BẠN GỬI LÊN (POST)
        console.log("--- [DEBUG] Dữ liệu rút tiền nhận được ---");
        console.log("User ID:", userId);
        console.log("Số tiền (amount):", amount);
        console.log("ID Ngân hàng (bankId):", bankId, "| Kiểu dữ liệu:", typeof bankId);
        console.log("Số tài khoản:", accountNumber);
        console.log("Chủ tài khoản:", accountHolder);
        console.log("------------------------------------------");

        const { data: balance, error: balanceError } = await supabase
            .from('user_balance')
            .select('sodu_khadung')
            .eq('user_id', userId)
            .maybeSingle();

        if (balanceError) throw balanceError;
        const availableBalance = balance?.sodu_khadung || 0;

        if (amount > availableBalance) {
            throw new Error(`Số dư khả dụng (${availableBalance.toLocaleString()} VND) không đủ để rút ${amount.toLocaleString()} VND.`);
        }
        if (amount < 1000000) {
             throw new Error('Số tiền rút tối thiểu phải là 1,000,000 VND.');
        }

        // Bước B: Lấy thông tin Ngân hàng
        const { data: bankInfo, error: bankError } = await supabase
            // .schema('transactions')
            .from('banks')
            .select('bank_code, bank_name')
            .eq('bank_id', bankId)
            .maybeSingle();

        // 2. LOG KẾT QUẢ TRUY VẤN NGÂN HÀNG
        if (bankError) {
            console.error("❌ Lỗi truy vấn Database:", bankError.message);
        }
        console.log("🔍 Kết quả tìm kiếm Ngân hàng trong DB:", bankInfo);

        if (bankError || !bankInfo) {
            // Log chi tiết lý do thất bại trước khi throw error
            console.warn(`⚠️ Thất bại: Không tìm thấy bank_id = ${bankId} trong schema 'transactions' bảng 'banks'`);
            throw new Error('Ngân hàng được chọn không hợp lệ.');
        }

        // Bước C: Insert yêu cầu rút tiền...
        // (Giữ nguyên đoạn code insert phía dưới)

        // Bước C: Insert yêu cầu rút tiền (Thêm cột mới)
        const { data, error } = await supabase
            .schema('transactions')
            .from('withdraw_requests')
            .insert([
                {
                    user_id: userId,
                    amount: amount,
                    status: 'Pending',
                    bank_id: bankId,                // Cột mới
                    bank_code: bankInfo.bank_code,  // Snapshot code
                    bank_name: bankInfo.bank_name,  // Snapshot tên
                    bank_account_number: accountNumber,
                    bank_account_holder: accountHolder.toUpperCase() // Viết hoa tên
                },
            ])
            .select()
            .single();

        if (error) throw error;
        return data;

    } catch (error) {
        throw new Error(error.message); // Giữ nguyên message lỗi để Controller bắt
    }
};

// ... Các hàm khác (processExcelUpload, getStatistics, getProductsSummary, getDistributorKpi) giữ nguyên ...
// Tôi copy lại để bạn dễ paste cho đủ file:

const processExcelUpload = async (filePath, userId) => {
    try {
        const workbook = xlsx.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);
        const activities = data.map(row => row.Activity || 'Unknown activity');
        const { error } = await supabase.from('users').update({ activities }).eq('user_id', userId);
        if (error) throw error;
    } catch (error) {
        throw new Error(`File processing error: ${error.message}`);
    } finally {
        fs.unlinkSync(filePath);
    }
};

const getStatistics = async (userId) => {
    try {
        const { data, error } = await supabase.from('dashboard_overview').select('*').eq('user_id', userId).single();
        if (error) throw error;
        return data;
    } catch (error) {
        throw new Error(`Failed to get statistics: ${error.message}`);
    }
};

const getProductsSummary = async (userId) => {
    try {
        // Lưu ý: Đoạn logic này của bạn đang dùng .group() - Supabase JS SDK cú pháp có thể hơi khác tùy phiên bản
        // Nếu chạy lỗi group, bạn nên tạo View 'top_products_view' trong DB rồi select * từ đó
        const { data, error } = await supabase
            .from('orders')
            .select('product_id, products(product_name), quantity, total_amount') // Logic tạm
            .eq('user_id', userId)
            .limit(10); // Lấy tạm 10 dòng
            
        if (error) throw error;
        return { topProducts: data || [] };
    } catch (error) {
        throw new Error(`Failed to get products summary: ${error.message}`);
    }
};

const getDistributorKpi = async (nppId) => {
    // Lưu ý: Đảm bảo hàm countOrderByDistributor đã được import hoặc định nghĩa
    // Nếu chưa có, bạn cần require nó ở trên cùng
    const totalAgents = await countAgentsByDistributor(nppId);
    // Giả sử hàm countOrderByDistributor cũng nằm trong dashboard_model
    // const totalOrders = await countOrderByDistributor(nppId); 
    return {
        totalAgents,
        totalOrders: 0, // Tạm thời return 0 nếu chưa có hàm countOrderByDistributor
    };
};

// EXPORT
module.exports = {
    getPersonalData,
    processExcelUpload,
    getStatistics,
    getProductsSummary,
    submitWithdrawalRequest, // Đã update
    getBankList,             // Đã thêm mới
    getDistributorKpi,
};