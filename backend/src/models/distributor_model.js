const supabase = require("../config/supabaseClient");


// 🟢 Lấy toàn bộ danh sách nhà phân phối
const getAllNPP = async () => {
  const { data, error } = await supabase
    .from("nhaphanphoi_view")  // bảng trong schema member
    .select("*")
    .order("npp_id", { ascending: true });

  if (error) throw error;
  return data;
};

/**
 * ✔ Lấy danh sách đơn hàng thuộc nhà phân phối
 * @param {number} nppId - ID nhà phân phối
 */
const getOrdersByDistributor = async (nppId) => {
  const { data, error } = await supabase
    .from("npp_order_detail")
    .select("*")
    .eq("npp_id", nppId)
    .order("tao_vao_luc", { ascending: false });

  if (error) {
    console.error("Supabase error getOrdersByDistributor:", error);
    throw new Error("Database query failed");
  }

  return data;
};

async function getAgentsByNPP(npp_id) {
  // 1️⃣ Lấy danh sách agent_id từ bảng phân phối
  const { data: mapData, error: mapError } = await supabase
    .from("npp_phanphoi_product")
    .select("agent_id")
    .eq("npp_id", npp_id);

  if (mapError) throw mapError;

  if (!mapData || mapData.length === 0) return [];

  // Lấy list agent_id unique
  const agentIds = [...new Set(mapData.map(item => item.agent_id).filter(Boolean))];

  if (agentIds.length === 0) return [];

  // 2️⃣ Query bảng agent để lấy dữ liệu chi tiết
  const { data: agents, error: agentError } = await supabase
    .from("agent_view ")
    .select(`
      agent_id,
      agent_code,
      agent_name,
      phone,
      diachi,
      ngaythamgia
    `)
    .in("agent_id", agentIds);

  if (agentError) throw agentError;

  return agents;
}

module.exports = { getOrdersByDistributor, getAllNPP, getAgentsByNPP };