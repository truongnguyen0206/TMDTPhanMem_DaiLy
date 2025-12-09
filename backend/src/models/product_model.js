const supabase = require("../config/supabaseClient");

// === Lấy toàn bộ sản phẩm trong tất cả đơn hàng ===
const getAllProducts = async () => {
  const { data, error } = await supabase
    .from("product")
    .select("*")
    .order("product_id", { ascending: true });

  if (error) throw error;
  return data;
};

// === Thêm sản phẩm ===
const createOrderProduct = async (data) => {
  const { order_id, product_id, product_name, description, quantity, unit_price } = data;

  const { data: result, error } = await supabase
    .from("product")
    .insert([
      { product_id, product_name, description, quantity, unit_price },
    ])
    .select("*")
    .single();

  if (error) throw error;
  return result;
};

// === Cập nhật sản phẩm ===
const updateOrderProduct = async (id, updates) => {
  const allowedFields = ["product_name", "description", "quantity", "unit_price"];
  const validUpdates = Object.fromEntries(
    Object.entries(updates).filter(([key]) => allowedFields.includes(key))
  );

  if (Object.keys(validUpdates).length === 0) return null;

  const { data, error } = await supabase
    .from("product")
    .update(validUpdates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
};

// === Xóa sản phẩm ===
const deleteOrderProduct = async (id) => {
  const { data, error } = await supabase
    .from("product")
    .delete()
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
};

// === Lấy danh sách sản phẩm theo order_id ===
const getProductsByOrder = async (order_id) => {
  const { data, error } = await supabase
    .from("product")
    .select("*")
    .eq("order_id", order_id)
    .order("id", { ascending: true });

  if (error) throw error;
  return data;
};

//========================================
//Phần tạo link cho sản phẩm
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
  getAllProducts,
  createOrderProduct,
  updateOrderProduct,
  deleteOrderProduct,
  getProductsByOrder,
  checkReferralExists,
  findReferral,
  createReferralRow,
  getRoleName,
};
