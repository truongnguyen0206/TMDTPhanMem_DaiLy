const OrderModel = require("../models/order_model");
const {
    checkReferralExists,
    createReferralRow,
    findReferral,
    createOrderRow,
    getRoleName
  } = require("../models/order_model");
  
const PREFIX = {
    3: "AGT", // Đại lý
    4: "CTV", // Cộng tác viên
};

function randomCode(prefix) {
    return `${prefix}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}


async function createReferralLink(owner_id, owner_role_id) {
    if (!owner_id || !owner_role_id)
        throw new Error("owner_id và owner_role_id là bắt buộc");

    const prefix = PREFIX[owner_role_id] || "REF";

    let referral_code = randomCode(prefix);

    // Tránh trùng mã
    while (await checkReferralExists(referral_code)) {
        referral_code = randomCode(prefix);
    }

    const row = await createReferralRow({
        referral_code,
        owner_id,
        owner_role_id,
        status: true
    });

    return {
        ...row,
        link: `https://softshop.vn/order/?ref=${referral_code}`
    };
}

async function createOrder(payload, currentUser = null) {
    const {
      customer_id,
      product_id,
      quantity,
      total_amount,
      referral_code
    } = payload;
  
    let user_id = null;
  
    // Nếu có referral_code
    if (referral_code) {
      const ref = await findReferral(referral_code);
      if (!ref) throw new Error("Mã giới thiệu không hợp lệ");
  
      user_id = ref.owner_id;
    } else {
      // fallback (nếu user tự đặt)
      user_id = currentUser ? currentUser.id : null;
    }
  
    // Lấy order_source từ role_name
    const order_source = await getRoleName(user_id);
  
    const orderData = {
      order_code: null,
      order_date: new Date().toISOString(),
      created_by: currentUser ? currentUser.id : "Không rõ người tạo đơn",
  
      customer_id,
      product_id,
      quantity,
      total_amount,
  
      referral_code,
      user_id,
      order_source,
  
      order_status: "Chờ xử lý",
      payment_status: "Chờ thanh toán"
    };
  
    const order_id = await createOrderRow(orderData);
  
    return { order_id };
  }
  
module.exports = {
    createReferralLink,
    createOrder
};