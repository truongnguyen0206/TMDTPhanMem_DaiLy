const supabase = require("../config/supabaseClient");

class CommissionRuleModel {
  // 🟢 CẤU HÌNH SCHEMA VÀ TÊN BẢNG
  static SCHEMA_NAME = "transactions"; // Schema chứa bảng thật
  static TABLE_NAME = "commission_rules"; // Tên bảng thật
  static VIEW_NAME = "commissionrule"; // Tên View (nằm ở public)

  // ==========================================================
  // PHẦN ĐỌC DỮ LIỆU (Dùng View ở public - Giữ nguyên)
  // ==========================================================
  
  // 1. Lấy danh sách
  static async getAll() {
    const { data, error } = await supabase
      .from(this.VIEW_NAME) // View mặc định ở public nên không cần .schema()
      .select('*')
      .order("role_id", { ascending: true })
      .order("min_sales", { ascending: true });

    if (error) throw new Error(`Lỗi lấy danh sách quy tắc: ${error.message}`);
    return data || [];
  }

  // 2. Lấy chi tiết
  static async getById(ruleId) {
    const { data, error } = await supabase
      .from(this.VIEW_NAME)
      .select("*")
      .eq("rule_id", ruleId)
      .single();

    if (error) throw new Error(`Lỗi lấy quy tắc ${ruleId}: ${error.message}`);
    return data;
  }

  // 3. Lấy theo Role
  static async getByRole(roleId) {
    const { data, error } = await supabase
      .from(this.VIEW_NAME)
      .select("*")
      .eq("role_id", roleId)
      .order("min_sales", { ascending: true });

    if (error) throw new Error(`Lỗi lấy quy tắc theo role: ${error.message}`);
    return data || [];
  }

  // ==========================================================
  // PHẦN GHI DỮ LIỆU (Dùng Bảng thật ở schema 'transactions')
  // 👉 PHẢI DÙNG .schema() ĐỂ TRÁNH LỖI "Could not find table"
  // ==========================================================

  // 4. TẠO MỚI
  static async create(ruleData) {
    const validData = this._cleanData(ruleData);

    const { data, error } = await supabase
      .schema(this.SCHEMA_NAME) // 👈 QUAN TRỌNG: Chỉ định schema 'transactions'
      .from(this.TABLE_NAME)    // Tên bảng 'commission_rules'
      .insert([validData])
      .select()
      .single();

    if (error) throw new Error(`Lỗi tạo quy tắc: ${error.message}`);
    return data;
  }

  // 5. CẬP NHẬT
  static async update(ruleId, ruleData) {
    const validData = this._cleanData(ruleData);

    const { data, error } = await supabase
      .schema(this.SCHEMA_NAME) // 👈 QUAN TRỌNG
      .from(this.TABLE_NAME)
      .update(validData)
      .eq("rule_id", ruleId)
      .select()
      .single();

    if (error) throw new Error(`Lỗi cập nhật quy tắc: ${error.message}`);
    return data;
  }

  // 6. XÓA
  static async delete(ruleId) {
    const { data, error } = await supabase
      .schema(this.SCHEMA_NAME) // 👈 QUAN TRỌNG
      .from(this.TABLE_NAME)
      .delete()
      .eq("rule_id", ruleId)
      .select()
      .single();

    if (error) throw new Error(`Lỗi xóa quy tắc: ${error.message}`);
    return data;
  }

  // 7. Lấy danh sách Roles (Schema auth hoặc public tùy cấu hình, thường auth là hệ thống)
  // Lưu ý: Nếu bảng roles của bạn nằm ở schema 'auth', hãy dùng .schema('auth')
  static async getRoles() {
    const { data, error } = await supabase
      .from("users_roles") // Supabase thường tự hiểu cú pháp này cho các bảng hệ thống
      // Hoặc nếu lỗi, thử: .schema('auth').from('roles')
      .select("*")
      .order("role_name", { ascending: true });

    if (error) throw new Error(`Lỗi lấy roles: ${error.message}`);
    return data || [];
  }

  // 8. KIỂM TRA XUNG ĐỘT
  static async checkConflict(ruleData, excludeRuleId = null) {
    const { 
        role_id, scope_type, 
        product_category, product_id, 
        start_date, end_date, 
        min_sales, max_sales 
    } = ruleData;

    let query = supabase.from(this.VIEW_NAME).select("*").eq("role_id", role_id);

    if (excludeRuleId) query = query.neq("rule_id", excludeRuleId);

    const { data, error } = await query;
    if (error) throw new Error(`Lỗi check conflict: ${error.message}`);
    if (!data || data.length === 0) return false;

    // Logic kiểm tra chồng chéo
    const hasConflict = data.some((existingRule) => {
        if (existingRule.scope_type !== scope_type) return false;
        if (scope_type === 'CATEGORY' && existingRule.product_category !== product_category) return false;
        if (scope_type === 'PRODUCT' && existingRule.product_id !== product_id) return false;

        const newStart = new Date(start_date);
        const newEnd = end_date ? new Date(end_date) : null;
        const existStart = new Date(existingRule.start_date);
        const existEnd = existingRule.end_date ? new Date(existingRule.end_date) : null;
        const isTimeOverlap = (!newEnd || newEnd >= existStart) && (!existEnd || existEnd >= newStart);
        
        const nMin = parseFloat(min_sales || 0);
        const nMax = max_sales ? parseFloat(max_sales) : Infinity;
        const eMin = parseFloat(existingRule.min_sales || 0);
        const eMax = existingRule.max_sales ? parseFloat(existingRule.max_sales) : Infinity;
        const isSalesOverlap = (nMin < eMax) && (nMax > eMin);

        return isTimeOverlap && isSalesOverlap;
    });

    return hasConflict;
  }

  // 🛠️ Hàm Helper
  static _cleanData(data) {
    const allowedFields = [
      'role_id', 'min_sales', 'max_sales', 'commission_rate', 'product_category', 
      'product_id', 'start_date', 'end_date', 'description', 'scope_type', 
      'max_commission_cap', 'status', 'created_by'
    ];

    const clean = {};
    Object.keys(data).forEach(key => {
        if (allowedFields.includes(key) && data[key] !== undefined) {
            if ((key === 'product_id' || key === 'max_sales' || key === 'min_sales') && data[key] === '') {
                clean[key] = null;
            } else {
                clean[key] = data[key];
            }
        }
    });
    return clean;
  }
}

module.exports = CommissionRuleModel;