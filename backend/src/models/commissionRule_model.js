const supabase = require("../config/supabaseClient");

class CommissionRuleModel {

  // 🟩 Lấy tất cả quy tắc hoa hồng (Có thể dùng view hoặc bảng thật)
  static async getAll() {
    const { data, error } = await supabase
      .from("commissionrule") 
      .select(`
        *, 
        "scope_type", 
        "max_commission_cap", 
        "status", 
        "created_by"
      `)
      .order("role_id", { ascending: true })
      .order("min_sales", { ascending: true });

    if (error) throw new Error(`Lỗi khi lấy danh sách quy tắc hoa hồng: ${error.message}`);
    return data || [];
  }

  // 🟨 Lấy quy tắc theo ID
  static async getById(ruleId) {
    const { data, error } = await supabase
      .from("commissionrule")
      .select("*")
      .eq("rule_id", ruleId)
      .single();

    if (error) throw new Error(`Lỗi khi lấy quy tắc hoa hồng: ${error.message}`);
    return data;
  }

  // 🟦 Lấy quy tắc theo Role
  static async getByRole(roleId) {
    const { data, error } = await supabase
      .from("commissionrule")
      .select("*")
      .eq("role_id", roleId)
      .order("min_sales", { ascending: true });

    if (error) throw new Error(`Lỗi khi lấy quy tắc theo vai trò: ${error.message}`);
    return data || [];
  }

  // 🟧 TẠO MỚI (SỬA LỖI: Ghi vào bảng thật FULL_TABLE)
  static async create(ruleData) {
    const {
      role_id, min_sales = 0, max_sales, commission_rate, product_category,
      start_date = new Date().toISOString().split("T")[0], end_date, description,
      scope_type = 'CATEGORY', max_commission_cap, status = 'Active', created_by,
    } = ruleData;

    const { data, error } = await supabase
      .from("commissionrule") // 💡 Đã thay đổi từ "commissionrule" thành this.FULL_TABLE
      .insert([{
          role_id, min_sales, max_sales, commission_rate, product_category,
          start_date, end_date, description,
          scope_type, max_commission_cap, status, created_by,
      }])
      .select()
      .single();

    if (error) throw new Error(`Lỗi khi tạo quy tắc hoa hồng: ${error.message}`);
    return data;
  }

  // 🟪 CẬP NHẬT (SỬA LỖI: Ghi vào bảng thật FULL_TABLE)
  static async update(ruleId, ruleData) {
    const {
      role_id, min_sales, max_sales, commission_rate, product_category,
      start_date, end_date, description,
      scope_type, max_commission_cap, status, created_by,
    } = ruleData;

    // Lọc bỏ undefined
    const updatePayload = {
        role_id, min_sales, max_sales, commission_rate, product_category, 
        start_date, end_date, description,
        scope_type, max_commission_cap, status, created_by
    };
    Object.keys(updatePayload).forEach(key => updatePayload[key] === undefined && delete updatePayload[key]);

    const { data, error } = await supabase
      .from("commissionrule") // 💡 Đã thay đổi từ "commissionrule" thành this.FULL_TABLE
      .update(updatePayload)
      .eq("rule_id", ruleId)
      .select()
      .single();

    if (error) throw new Error(`Lỗi khi cập nhật quy tắc hoa hồng: ${error.message}`);
    return data;
  }

  // 🟥 XÓA (SỬA LỖI: Xóa từ bảng thật FULL_TABLE)
  static async delete(ruleId) {
    const { data, error } = await supabase
      .from("commissionrule") 
      .delete()
      .eq("rule_id", ruleId)
      .select()
      .single();

    if (error) throw new Error(`Lỗi khi xóa quy tắc hoa hồng: ${error.message}`);
    return data;
  }

  // 🟨 Lấy danh sách Roles (Sửa schema)
  static async getRoles() {
    const { data, error } = await supabase
      .from("auth.roles") 
      .select("*")
      .order("role_name", { ascending: true });

    if (error) throw new Error(`Lỗi khi lấy danh sách vai trò: ${error.message}`);
    return data || [];
  }

  // ⚠️ Kiểm tra xung đột
  static async checkConflict(ruleData, excludeRuleId = null) {
    const { role_id, min_sales, max_sales, product_category, start_date, end_date } = ruleData;

    let query = supabase.from("commissionrule").select("*").eq("role_id", role_id);

    if (product_category) query = query.eq("product_category", product_category);
    else query = query.is("product_category", null);

    if (excludeRuleId) query = query.neq("rule_id", excludeRuleId);

    const { data, error } = await query;
    if (error) throw new Error(`Lỗi khi kiểm tra xung đột: ${error.message}`);

    const filtered = (data || []).filter((rule) => {
      const currentStart = new Date(start_date);
      const currentEnd = end_date ? new Date(end_date) : null;
      const ruleStart = new Date(rule.start_date);
      const ruleEnd = rule.end_date ? new Date(rule.end_date) : null;

      const overlapDate = (!ruleEnd || ruleEnd >= currentStart) && (!currentEnd || currentEnd >= ruleStart);
      
      const rMin = parseFloat(rule.min_sales||0), rMax = rule.max_sales ? parseFloat(rule.max_sales) : null;
      const cMin = parseFloat(min_sales||0), cMax = max_sales ? parseFloat(max_sales) : null;
      const overlapSales = (rMax === null || rMax >= cMin) && (cMax === null || cMax >= rMin);

      return overlapDate && overlapSales;
    });

    return filtered.length > 0;
  }
}

module.exports = CommissionRuleModel;