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

module.exports = {
  getAllCTV,
  getCTVById,
  getCTVByCode,
  createCTV,
  updateCTV,
  softDeleteCTV,
};
