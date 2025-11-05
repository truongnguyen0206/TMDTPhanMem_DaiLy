const supabase = require("../config/supabaseClient");

// === Lấy toàn bộ sản phẩm trong tất cả đơn hàng ===
const getAllProducts = async () => {
  const { data, error } = await supabase
    .from("v_order_product")
    .select("*")
    .order("product_id", { ascending: true });

  if (error) throw error;
  return data;
};

// === Thêm sản phẩm ===
const createOrderProduct = async (data) => {
  const { order_id, product_id, product_name, description, quantity, unit_price } = data;

  const { data: result, error } = await supabase
    .from("v_order_product")
    .insert([
      { order_id, product_id, product_name, description, quantity, unit_price },
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
    .from("v_order_product")
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
    .from("v_order_product")
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
    .from("v_order_product")
    .select("*")
    .eq("order_id", order_id)
    .order("id", { ascending: true });

  if (error) throw error;
  return data;
};

module.exports = {
  getAllProducts,
  createOrderProduct,
  updateOrderProduct,
  deleteOrderProduct,
  getProductsByOrder,
};
