const db = require('../config/supabaseClient'); // Dùng cho Transaction
const OrderModel = require('../models/order_model');

class OrderService {
    async createOrder(orderData) {
        // Bắt đầu một Transaction để đảm bảo tính toàn vẹn (ACID)
        return db.tx(async t => {
            // 1. Chèn Order Header. Khi lệnh này chạy thành công,
            //    DB Trigger 'trg_calc_commission' sẽ được kích hoạt TỰ ĐỘNG.
            const orderHeader = await OrderModel.createOrderHeader(orderData, t);

            // 2. Chèn chi tiết mặt hàng
            if (orderData.items && orderData.items.length > 0) {
                 await OrderModel.createOrderItems(orderHeader.order_id, orderData.items, t);
            }
            
            // 3. Toàn bộ logic tính Cấp 1 & Cấp 2 được xử lý bởi PL/pgSQL Function,
            //    giúp giảm tải logic tài chính phức tạp cho Backend.
            
            return { orderId: orderHeader.order_id, message: "Đơn hàng và Hoa hồng được xử lý thành công." };
        });
    }
}
module.exports = new OrderService();