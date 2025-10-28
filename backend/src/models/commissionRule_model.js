const supabase = require('../config/database_config'); // Chỉ cần đi lên một cấp

// Trách nhiệm: Chỉ truy vấn và trả về kết quả thô từ database.

/**
 * Lấy tất cả các luật hoa hồng từ CSDL.
 */
const findAll = async () => {
    return supabase.from("commission_rules").select("*, roles(role_name)");
};

/**
 * Tìm một luật theo ID.
 * @param {string} ruleId - ID của luật cần tìm.
 */
const findById = async (ruleId) => {
    return supabase.from("commission_rules").select("*").eq("rule_id", ruleId).single();
};

/**
 * Tạo một luật mới.
 * @param {object} ruleData - Dữ liệu của luật mới.
 */
const create = async (ruleData) => {
    return supabase.from("commission_rules").insert([ruleData]).select().single();
};

/**
 * Cập nhật một luật theo ID.
 * @param {string} ruleId - ID của luật cần cập nhật.
 * @param {object} ruleData - Dữ liệu mới để cập nhật.
 */
const update = async (ruleId, ruleData) => {
    return supabase.from("commission_rules").update(ruleData).eq("rule_id", ruleId).select().single();
};

/**
 * Xóa một luật theo ID.
 * @param {string} ruleId - ID của luật cần xóa.
 */
const remove = async (ruleId) => {
    return supabase.from("commission_rules").delete().eq("rule_id", ruleId);
};

module.exports = {
    findAll,
    findById,
    create,
    update,
    remove,
};