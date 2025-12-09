// const pool = require("../config/database_config");
const supabase = require("../config/supabaseClient");

// Lấy tất cả orders (không join items)
const getAll = async () => {
  const { data, error } = await supabase
    .from("orders_view")
    .select("*")
    .order("order_date", { ascending: false });

  if (error) throw error;
  return data;
};

const getOrderById = async (orderId) => {
  const { data, error } = await supabase
    .from("orders_view")
    .select("*")
    .eq("order_id", orderId)
    .single();

  if (error) throw error;
  return data;
};

// // ========================================
// // 🟧 LẤY ĐƠN HÀNG THEO CỘNG TÁC VIÊN
// // ========================================
// const getByCollaboratorId = async (collaborator_id) => {
//   const { data, error } = await supabase
//     .from("orders_view")
//     .select("*")
//     .eq("collaborator_id", collaborator_id)
//     .order("order_date", { ascending: false });

//   if (error) throw error;
//   return data || [];
// };

// // ========================================
// // 🟦 LẤY ĐƠN HÀNG THEO KHÁCH HÀNG
// // ========================================
// const getByCustomerId = async (customer_id) => {
//   const { data, error } = await supabase
//     .from("orders_view")
//     .select("*")
//     .eq("customer_id", customer_id)
//     .order("order_date", { ascending: false });

//   if (error) throw error;
//   return data || [];
// };


// ========================================
// 🟧 LẤY ĐƠN HÀNG THEO USER (ID + ROLE)
// ========================================
const getByUser = async (user_id, role_id) => {
  // tạo builder query
  let query = supabase.from("orders_view").select("*");

  if (user_id) query = query.eq("user_id", user_id);
  if (role_id) query = query.eq("role_id", role_id); // hoặc .eq("role_name", "Cộng tác viên")

  const { data, error } = await query.order("order_date", { ascending: false });

  if (error) throw error;
  return data || [];
};

// Lấy 1 order theo id (không join items)
const getById = async (order_id) => {
  const { data, error } = await supabase
    .from("orders_view")
    .select("*")
    .eq("order_id", order_id)
    .single();

  if (error) throw error;
  return data;
};

// // =========================
// // MAP TRẠNG THÁI
// // =========================
// const ORDER_STATUS_MAP = {
//   1: "chờ xử lý",
//   2: "đã xác nhận",
//   3: "đã hoàn thành",
//   4: "đã hủy"
// };

// const PAYMENT_STATUS_MAP = {
//   1: "chờ thanh toán",
//   2: "đã thanh toán",
//   3: "đã hoàn tiền"
// };


const create = async (order) => {

  const { data, error } = await supabase
    .from("orders_view")
    .insert([
      {
        order_date: order.order_date || new Date(),
        total_amount: order.total_amount || 0,
        created_by: order.created_by || null,
        customer_id: order.customer_id || null,
        order_source: order.order_source || "Khách hàng",

        // nhận y nguyên từ FE
        order_status: order.order_status,
        payment_status: order.payment_status
      }
    ])
    .select("order_id")
    .single();

  if (error) throw error;
  return data.order_id;
};


async function createOrderRow(orderData) {
  const { data, error } = await supabase
    .from("orders_view")
    .insert(orderData)
    .select("order_id")
    .single();

  if (error) throw error;
  return data.order_id;
}

// Update order
const update = async (order_id, updates) => {
  const allowedFields = [
    "customer_id",
    "product_id",
    "quantity",
    "total_amount",
    "order_source",
    "order_status",
    "payment_status",
    "created_by"
  ];

  const validUpdates = {};
  for (const key of allowedFields) {
    if (updates[key] !== undefined) validUpdates[key] = updates[key];
  }

  if (Object.keys(validUpdates).length === 0) return null;

  const { data, error } = await supabase
    .from("orders_view")
    .update(validUpdates)
    .eq("order_id", order_id)
    .select()
    .single();

  if (error) throw error;
  return data;
};



// Xóa order
const remove = async (order_id) => {
  const { error } = await supabase
    .from("orders_view")
    .delete()
    .eq("order_id", order_id);

  if (error) throw error;
  return true;
};

// // Tạo order kèm items (transaction)
// const createOrderWithItems = async ({ order, items }) => {
//   const { data, error } = await supabase.rpc("fn_create_order_with_items", {
//     order_data: order,
//     items: items,
//   });

//   if (error) {
//     console.error("❌ Error creating order:", error);
//     throw error;  
//   }

//   return data;
// };

// // Lấy order kèm items
// const getOrderById = async (order_id) => {
//   const { data, error } = await supabase
//     .from("orders_view") // 👈 nếu bạn tạo view `public.orders` trỏ tới `orders_view`
//     .select(`
//       *,
//       order_product:order_product (
//         id,
//         product_id,
//         product_name,
//         quantity,
//         unit_price
//       )
//     `)
//     .eq("order_id", order_id)
//     .maybeSingle(); // Lấy đúng 1 bản ghi hoặc null

//   if (error) {
//     console.error("❌ Error fetching order:", error);
//     throw error;
//   }

//   // Đổi tên trường cho khớp với format cũ
//   return {
//     ...data,
//     products: data?.order_product || [],
//   };
// };


/**
 * 📋 Lấy danh sách chi tiết đơn hàng từ VIEW `orders.v_order_detail`
 * Có thể lọc theo: user_id (người giới thiệu), từ ngày - đến ngày, limit, offset
 */
const listOrders = async ({ limit = 50, offset = 0, user_id, from, to } = {}) => {
  let query = supabase
    .from("v_order_detail")
    .select("*")
    .order("tao_vao_luc", { ascending: false })
    .range(offset, offset + limit - 1);

  if (user_id) query = query.eq("nguoi_gioi_thieu", user_id);
  if (from) query = query.gte("tao_vao_luc", from);
  if (to) query = query.lte("tao_vao_luc", to);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

/**
 * 🔍 Lấy chi tiết 1 đơn hàng theo mã (order_code)
 */
const getOrderDetail = async (order_code) => {
  const { data, error } = await supabase
    .from("v_order_detail")
    .select("*")
    .eq("ma_don_hang", order_code)
    .maybeSingle()

  if (error) throw error;
  return data;
};

/**
 * 🧭 Lấy log thay đổi nguồn gốc của đơn hàng (từ order_origin_log)
 */
const getOrderOriginLogs = async (order_id) => {
  const { data, error } = await supabase
    .from("orders.order_origin_log")
    .select(
      `
      log_id,
      order_id,
      old_source,
      new_source,
      old_agent,
      new_agent,
      old_collaborator,
      new_collaborator,
      changed_reason,
      changed_by,
      changed_at
      `
    )
    .eq("order_id", order_id)
    .order("changed_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

//========================================
//Làm Thêm Phần đếm cơ bản( An Làm)
//========================================

// Hàm đếm chung cho đơn hàng theo bộ lọc
const countOrders = async (filters = {}) => {
  // ✅ SỬA LẠI TÊN VIEW ĐÚNG LÀ: v_order_detail
  let query = supabase.from("v_order_detail").select("*", { count: "exact", head: true });
  
  // 1. Lọc theo Trạng thái đơn hàng
  if (filters.status) {
      query = query.eq("trang_thai_don_hang", filters.status);
  }

  // 2. Lọc theo Nguồn tạo đơn
  if (filters.source) {
      query = query.eq("nguon_tao_don", filters.source);
  }
  
  // 3. Lọc theo Trạng thái thanh toán
  if (filters.payment_status) {
      query = query.eq("trang_thai_thanh_toan", filters.payment_status);
  }
  
  const { count, error } = await query;
  
  if (error) {
      // Log lỗi chi tiết ra terminal để dễ debug nếu sai tên cột
      console.error(`❌ Lỗi đếm đơn (Status: ${filters.status}, Source: ${filters.source}):`, error);
      throw error;
  }
  return count || 0;
};

// Hàm tính tổng doanh thu
const getTotalRevenue = async () => {
  // ✅ SỬA LẠI TÊN VIEW: v_order_detail
  const { data, error } = await supabase
    .from("v_order_detail")
    .select("tong_tien") // Cột này chỉ có trong v_order_detail
    .not("tong_tien", "is", null); 
    
  if (error) {
      console.error("❌ Lỗi tính tổng doanh thu:", error);
      throw error;
  }
  
  return data.reduce((sum, order) => sum + (Number(order.tong_tien) || 0), 0);
};


const getOrdersForTopPartners = async () => {
  // Lấy cột người tạo và nguồn tạo, loại bỏ các đơn đã hủy
  const { data, error } = await supabase
    .from("v_order_detail")
    .select("nguoi_tao_don, nguon_tao_don, so_luong, tong_tien")
    .neq("trang_thai_don_hang", "Đã hủy") // Không tính đơn hủy vào thành tích
    .not("nguoi_tao_don", "is", null);    // Bỏ qua nếu không có người tạo

  if (error) throw error;
  return data;
};


const getOrdersByYear = async (year) => {
  const startDate = `${year}-01-01T00:00:00.000Z`;
  const endDate = `${year}-12-31T23:59:59.999Z`;

  // Lấy ngày tạo và trạng thái của tất cả đơn trong năm
  const { data, error } = await supabase
    .from("v_order_detail")
    .select("tao_vao_luc, trang_thai_don_hang")
    .gte("tao_vao_luc", startDate)
    .lte("tao_vao_luc", endDate);

  if (error) throw error;
  return data || [];
};


//========================================
//Phần tạo link cho đơn hàng
//========================================

// Kiểm tra code trùng
async function checkReferralExists(referral_code) {
  const { data, error } = await supabase
    .from("referral_links")
    .select("referral_id")
    .eq("referral_code", referral_code)
    .maybeSingle();

  if (error) throw error;
  return data !== null;
}

// Tìm link theo referral_code
async function findReferral(referral_code) {
  const { data, error } = await supabase
    .from("referral_links")
    .select("referral_id, referral_code, owner_id, owner_role_id, status")
    .eq("referral_code", referral_code)
    .eq("status", true)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Tạo 1 row referral mới
async function createReferralRow(rowData) {
  const { data, error } = await supabase
    .from("referral_links")
    .insert(rowData)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Lấy role_name của user
async function getRoleName(user_id) {
  if (!user_id) return "Không xác định";

  const { data, error } = await supabase
    .from("web_auth.users")
    .select("role_id, roles(role_name)")
    .eq("user_id", user_id)
    .single();

  if (error) throw error;
  return data.roles.role_name;
}

module.exports = {
  getAll,
  getById,
  // getByCollaboratorId,
  // getByCustomerId,
  getByUser,
  create,
  createOrderRow,
  update,
  remove,
  // createOrderWithItems,
  getOrderById,
  listOrders,
  getOrderDetail,
  getOrderOriginLogs,
  countOrders,
  getTotalRevenue,
  getOrdersForTopPartners,
  getOrdersByYear,
  checkReferralExists,
  findReferral,
  createReferralRow,
  getRoleName,
};
