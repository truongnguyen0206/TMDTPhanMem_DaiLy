const supabase = require("../config/supabaseClient");

// const TABLE = 'member.ctv';

/** Lấy danh sách CTV với paging, tìm kiếm và lọc theo agent. */
async function getAllCTV(opts = {}) {
  const { agentId = null, search = '', limit = 50, page = 1 } = opts;

  let query = supabase.from("ctv_view")
    .select('ctv_id, user_id, ctv_code, ctv_name, diachi, ngaythamgia, agent_id')
    .order('ngaythamgia', { ascending: false });

  if (agentId) {
    query = query.eq('agent_id', agentId);
  }

  if (search) {
    query = query.or(`ctv_name.ilike.%${search}%,ctv_code.ilike.%${search}%,diachi.ilike.%${search}%`);
  }

  // Phân trang
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error } = await query.range(from, to);

  if (error) throw error;
  return data;
}

/** Lấy CTV theo id */
async function getCTVById(ctvId) {
  const { data, error } = await supabase
    .from("ctv_view")
    .select('ctv_id, user_id, ctv_code, ctv_name, diachi, ngaythamgia, agent_id')
    .eq('ctv_id', ctvId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

/** Lấy CTV theo code */
async function getCTVByCode(code) {
  const { data, error } = await supabase
    .from("ctv_view")
    .select('ctv_id')
    .eq('ctv_code', code)
    .maybeSingle();

  if (error) throw error;
  return data || null;
}

/** Tạo CTV mới */
async function createCTV(payload = {}) {
  if (!payload.ctv_name) {
    throw new Error('ctv_name is required');
  }

  const { data, error } = await supabase
    .from("ctv_view")
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Cập nhật CTV */
async function updateCTV(ctvId, payload = {}) {
  const allowed = ['user_id', 'ctv_code', 'ctv_name', 'diachi', 'ngaythamgia', 'agent_id'];
  const updates = {};

  for (const key of allowed) {
    if (payload[key] !== undefined) updates[key] = payload[key];
  }

  const { data, error } = await supabase
    .from("ctv_view")
    .update(updates)
    .eq('ctv_id', ctvId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Soft delete (set trangthai = 0) */
async function softDeleteCTV(ctvId) {
  const { error } = await supabase
    .from("ctv_view")
    .update({ trangthai: 0 })
    .eq('ctv_id', ctvId);

  if (error) throw error;
  return true;
}

/** Lấy danh sách đơn hàng của một CTV (không phân trang) */
async function getOrdersByCTVId(ctvId, opts = {}) {
  if (!ctvId) throw new Error("ctvId is required");

  const { search = '', status = null } = opts;

  // Lấy user_id từ CTV
  const { data: ctv, error: ctvErr } = await supabase
    .from("ctv_view")
    .select("ctv_id, user_id")
    .eq("ctv_id", ctvId)
    .maybeSingle();

  if (ctvErr) throw ctvErr;
  if (!ctv || !ctv.user_id) return [];

  let query = supabase
    .from("orders_view")  // đổi theo đúng view của bạn
    .select(`
      order_id,
      order_code,
      order_date,
      customer_id,
      total_amount,
      order_status,
      payment_status,
      user_id
    `)
    .eq("user_id", ctv.user_id)
    .order("order_date", { ascending: false });

  // Tìm kiếm theo order_code
  if (search) {
    query = query.ilike("order_code", `%${search}%`);
  }

  // Lọc trạng thái đơn
  if (status) {
    query = query.eq("order_status", status);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data || [];
}

module.exports = {
  getAllCTV,
  getCTVById,
  getCTVByCode,
  createCTV,
  updateCTV,
  softDeleteCTV,
  getOrdersByCTVId
};
