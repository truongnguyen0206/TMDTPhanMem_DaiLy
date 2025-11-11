const supabase = require("../config/supabaseClient");

class commissionrule {
  // 🟩 Lấy tất cả quy tắc hoa hồng
  static async getAll() {
    const { data, error } = await supabase
      .from("commissionrule") // ✅ view
      .select("*")
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

  // 🟧 Tạo quy tắc mới (ghi vào bảng thật)
  static async create(ruleData) {
    const {
      role_id,
      min_sales = 0,
      max_sales,
      commission_rate,
      product_category,
      start_date = new Date().toISOString().split("T")[0],
      end_date,
      description,
    } = ruleData;

    const { data, error } = await supabase
      .from("commissionrule") // ✅ bảng thật
      .insert([
        {
          role_id,
          min_sales,
          max_sales,
          commission_rate,
          product_category,
          start_date,
          end_date,
          description,
        },
      ])
      .select()
      .single();

    if (error) throw new Error(`Lỗi khi tạo quy tắc hoa hồng: ${error.message}`);
    return data;
  }

  // 🟪 Cập nhật quy tắc
  static async update(ruleId, ruleData) {
    const {
      role_id,
      min_sales = 0,
      max_sales,
      commission_rate,
      product_category,
      start_date,
      end_date,
      description,
    } = ruleData;

    const { data, error } = await supabase
      .from("commissionrule")
      .update({
        role_id,
        min_sales,
        max_sales,
        commission_rate,
        product_category,
        start_date,
        end_date,
        description,
      })
      .eq("rule_id", ruleId)
      .select()
      .single();

    if (error) throw new Error(`Lỗi khi cập nhật quy tắc hoa hồng: ${error.message}`);
    return data;
  }

  // 🟥 Xóa quy tắc
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

  // 🟨 Lấy danh sách Roles
  static async getRoles() {
    const { data, error } = await supabase
      .from("web_auth.roles")
      .select("*")
      .order("role_name", { ascending: true });

    if (error) throw new Error(`Lỗi khi lấy danh sách vai trò: ${error.message}`);
    return data || [];
  }

  // // 🟩 Lấy danh sách Product Categories
  // static async getProductCategories() {
  //   const { data, error } = await supabase
  //     .from("public.product_categories")
  //     .select("*")
  //     .order("category_name", { ascending: true });

  //   if (error) throw new Error(`Lỗi khi lấy danh sách danh mục sản phẩm: ${error.message}`);
  //   return data || [];
  // }

  // ⚠️ Kiểm tra xung đột quy tắc
  static async checkConflict(ruleData, excludeRuleId = null) {
    const {
      role_id,
      min_sales,
      max_sales,
      product_category,
      start_date,
      end_date,
    } = ruleData;

    let query = supabase
      .from("commissionrule")
      .select("*")
      .eq("role_id", role_id)
      .eq("product_category", product_category);

    if (excludeRuleId) query = query.neq("rule_id", excludeRuleId);

    const { data, error } = await query;
    if (error) throw new Error(`Lỗi khi kiểm tra xung đột quy tắc: ${error.message}`);

    const filtered = (data || []).filter((rule) => {
      const overlapDate =
        (!rule.end_date || new Date(rule.end_date) >= new Date(start_date)) &&
        (!end_date || new Date(end_date) >= new Date(rule.start_date));

      const overlapSales =
        (rule.max_sales === null || rule.max_sales >= min_sales) &&
        (max_sales === null || max_sales >= rule.min_sales);

      return overlapDate && overlapSales;
    });

    return filtered.length > 0;
  }
}

module.exports = commissionrule;
