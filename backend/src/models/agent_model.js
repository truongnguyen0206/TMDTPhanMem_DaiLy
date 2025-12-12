const supabase = require("../config/supabaseClient");

// const TABLE = "m";

/**
 * 🧩 Lấy toàn bộ danh sách đại lý
 */
const getAllAgents = async () => {
  const { data, error } = await supabase
    .from("agent_view")
    .select("*")
    .order("agent_id", { ascending: false });

  if (error) throw error;
  return data;
};


// Lấy danh sách CTV của đại lý hiện tại
const getCTVByAgent = async (agent_id) => {
  // Lấy danh sách CTV có agent_id trùng
  const { data: ctvList, error } = await supabase
    .from("ctv_view")
    .select("*, users_view (status))")
    .eq("agent_id", agent_id);

  if (error) throw error;

  return ctvList;
};

/**
 * 🔍 Lấy danh sách đại lý (tìm kiếm + phân trang)
 */
const listAgents = async ({ search = "", limit = 50, page = 1 } = {}) => {
  const from = (Math.max(1, Number(page)) - 1) * Number(limit);
  const to = from + Number(limit) - 1;

  let query = supabase
    .from("agent_view")
    .select("*", { count: "exact" })
    .order("agent_id", { ascending: false });

  if (search) {
    query = query.or(`agent_name.ilike.%${search}%,masothue.ilike.%${search}%`);
  }

  const { data, error } = await query.range(from, to);
  if (error) throw error;
  return data;
};

/**
 * ➕ Tạo mới đại lý
 */
const createAgent = async ({ user_id, agent_name, diachi, masothue }) => {
  const { data, error } = await supabase
    .from("agent_view")
    .insert([{ user_id, agent_name, diachi, masothue }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * 🔎 Lấy đại lý theo ID
 */
const getAgentById = async (agent_id) => {
  const { data, error } = await supabase
    .from("agent_view")
    .select("*")
    .eq("agent_id", agent_id)
    .single();

  if (error) throw error;
  return data;
};

/**
 * ✏️ Cập nhật thông tin đại lý
 */
const updateAgent = async (agent_id, fields) => {
  if (!fields || Object.keys(fields).length === 0)
    throw new Error("Không có dữ liệu để cập nhật.");

  const { data, error } = await supabase
    .from("agent_view")
    .update(fields)
    .eq("agent_id", agent_id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * ❌ Xóa đại lý theo user_id
 */
const deleteAgent = async (user_id) => {
  const { data, error } = await supabase
    .from("agent_view")
    .delete()
    .eq("user_id", user_id)
    .select()
    .single();

  if (error) throw error;
  return { success: !!data, deletedAgent: data };
};

/**
 * 🧩 Cập nhật nhiều đại lý
 */
const updateManyAgents = async (agents = []) => {
  if (!Array.isArray(agents) || agents.length === 0)
    throw new Error("Không có dữ liệu đại lý để cập nhật.");

  const results = [];
  for (const agent of agents) {
    const { agent_id, ...fields } = agent;
    if (!agent_id) throw new Error("Thiếu agent_id trong một đối tượng cập nhật.");

    const { data, error } = await supabase
      .from("agent_view")
      .update(fields)
      .eq("agent_id", agent_id)
      .select()
      .single();

    if (error) throw error;
    results.push(data);
  }

  return results;
};

/** Lấy tất cả đơn hàng của một đại lý (không phân trang) */
const getOrdersByAgent = async (agent_id, opts = {}) => {
  if (!agent_id) throw new Error("agent_id is required");

  const { search = '', status = null } = opts;

  // 1️⃣ Lấy user_id của agent
  const { data: agent, error: agentErr } = await supabase
    .from("agent_view")
    .select("agent_id, user_id")
    .eq("agent_id", agent_id)
    .single();

  if (agentErr) throw agentErr;
  if (!agent || !agent.user_id) return [];

  // 2️⃣ Lấy danh sách đơn hàng theo user_id của đại lý
  let query = supabase
    .from("orders_with_product")
    .select(`
        order_id,
        order_code,
        order_date,
        customer_id,
        product_id,
        product_code,
        product_name,
        quantity,
        total_amount,
        order_source,
        order_status,
        payment_status,
        user_id
    `)
    .eq("user_id", agent.user_id)
    .order("order_date", { ascending: false });

  // 3️⃣ Search theo order_code
  if (search) {
    query = query.ilike("order_code", `%${search}%`);
  }

  // 4️⃣ Filter theo trạng thái đơn
  if (status) {
    query = query.eq("order_status", status);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data || [];
};

const getOrdersOfCTVByAgent = async (agent_id, opts = {}) => {
  if (!agent_id) throw new Error("agent_id is required");

  const { search = '', status = null } = opts;

  // 1️⃣ Lấy danh sách CTV thuộc đại lý
  const { data: ctvList, error: ctvErr } = await supabase
    .from("ctv_view")
    .select("ctv_id, user_id")
    .eq("agent_id", agent_id);

  if (ctvErr) throw ctvErr;
  if (!ctvList || ctvList.length === 0) return [];

  // Lấy danh sách user_id của CTV
  const ctvUserIds = ctvList
    .filter(c => c.user_id)
    .map(c => c.user_id);

  if (ctvUserIds.length === 0) return [];

  // 2️⃣ Query tất cả đơn hàng của những user_id này
  let query = supabase
    .from("orders_with_product")
    .select(`
      order_id,
        order_code,
        order_date,
        customer_id,
        product_id,
        product_code,
        product_name,
        quantity,
        total_amount,
        order_source,
        order_status,
        payment_status,
        user_id
    `)
    .in("user_id", ctvUserIds)     // 👈 lấy đơn hàng của CTV
    .order("order_date", { ascending: false });

  // 3️⃣ Search theo order_code
  if (search) {
    query = query.ilike("order_code", `%${search}%`);
  }

  // 4️⃣ Filter trạng thái đơn
  if (status) {
    query = query.eq("order_status", status);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data || [];
};

/**
 * Lấy danh sách sản phẩm được phân phối cho 1 đại lý
 */
const getProductsByAgent = async (agent_id) => {
  const { data, error } = await supabase
    .from("agent_product_view")
    .select("*")
    .eq("agent_id", agent_id)
    .order("ngay_phanphoi", { ascending: false });

  if (error) throw error;
  return data;
};



module.exports = {
  getAllAgents,
  getCTVByAgent,
  listAgents,
  createAgent,
  getAgentById,
  updateAgent,
  deleteAgent,
  updateManyAgents,
  getOrdersByAgent,
  getOrdersOfCTVByAgent,
  getProductsByAgent
};
