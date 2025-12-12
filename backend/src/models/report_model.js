// models/report_model.js
const supabase = require("../config/supabaseClient");

// Lấy orders.raw theo khoảng ngày (nếu sau này bạn muốn dùng)
const getFilteredOrders = async (from, to) => {
  let query = supabase.from("orders.orders").select("*");

  if (from && to) {
    query = query.gte("order_date", from).lte("order_date", to);
  } else if (from) {
    query = query.gte("order_date", from);
  } else if (to) {
    query = query.lte("order_date", to);
  }

  query = query.order("order_date", { ascending: false });

  const { data, error } = await query;
  return { data, error };
};

// Lấy user + role_id
const getUserWithRole = async (userId) => {
  return supabase
    .from("users")
    .select("user_id, role_id")
    .eq("user_id", userId)
    .single();
};

// Lấy tên role
const getRoleNameById = async (roleId) => {
  return supabase
    .from("users_roles")
    .select("role_name")
    .eq("role_id", roleId)
    .single();
};

// Lấy agent_id theo user_id
const getAgentByUserId = async (userId) => {
  return supabase
    .from("agent_view")
    .select("agent_id")
    .eq("user_id", userId)
    .single();
};

// Lấy list CTV theo agent_id
const getCtvListByAgentId = async (agentId) => {
  return supabase
    .from("ctv_view")
    .select("user_id")
    .eq("agent_id", agentId);
};

// Lấy dữ liệu từ view v_order_detail theo user + ngày
const getOrdersFromView = async ({ allowedUserIds, from, to, isAdmin }) => {
  let query = supabase.from("v_order_detail").select("*");

  if (!isAdmin && Array.isArray(allowedUserIds) && allowedUserIds.length > 0) {
    query = query.in("user_id", allowedUserIds);
  }

  if (from) {
    query = query.gte("tao_vao_luc", from);
  }
  if (to) {
    query = query.lte("tao_vao_luc", to);
  }

  query = query.order("tao_vao_luc", { ascending: false });

  const { data, error } = await query;
  return { data, error };
};

module.exports = {
  getFilteredOrders,
  getUserWithRole,
  getRoleNameById,
  getAgentByUserId,
  getCtvListByAgentId,
  getOrdersFromView,
};
