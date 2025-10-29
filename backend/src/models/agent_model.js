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
    .select("*")
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

module.exports = {
  getAllAgents,
  getCTVByAgent,
  listAgents,
  createAgent,
  getAgentById,
  updateAgent,
  deleteAgent,
  updateManyAgents,
};
