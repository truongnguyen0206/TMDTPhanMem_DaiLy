const db = require('../config/db.config');

class CommissionRule {
  // Lấy tất cả quy tắc hoa hồng
  static async getAll() {
    try {
      const query = `
        SELECT 
          cr.*,
          r.role_name,
          pc.category_name
        FROM commission_rules cr
        LEFT JOIN roles r ON cr.role_id = r.role_id
        LEFT JOIN product_categories pc ON cr.product_category = pc.category_name
        ORDER BY cr.role_id, cr.min_sales
      `;
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Lấy quy tắc theo ID
  static async getById(ruleId) {
    try {
      const query = `
        SELECT 
          cr.*,
          r.role_name,
          pc.category_name
        FROM commission_rules cr
        LEFT JOIN roles r ON cr.role_id = r.role_id
        LEFT JOIN product_categories pc ON cr.product_category = pc.category_name
        WHERE cr.rule_id = $1
      `;
      const result = await db.query(query, [ruleId]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Lấy quy tắc theo role
  static async getByRole(roleId) {
    try {
      const query = `
        SELECT 
          cr.*,
          r.role_name,
          pc.category_name
        FROM commission_rules cr
        LEFT JOIN roles r ON cr.role_id = r.role_id
        LEFT JOIN product_categories pc ON cr.product_category = pc.category_name
        WHERE cr.role_id = $1
        ORDER BY cr.min_sales
      `;
      const result = await db.query(query, [roleId]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Tạo quy tắc mới
  static async create(ruleData) {
    try {
      const {
        role_id,
        min_sales,
        max_sales,
        commission_rate,
        product_category,
        start_date,
        end_date,
        description
      } = ruleData;

      const query = `
        INSERT INTO commission_rules 
        (role_id, min_sales, max_sales, commission_rate, product_category, start_date, end_date, description)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      
      const values = [
        role_id,
        min_sales || 0,
        max_sales,
        commission_rate,
        product_category,
        start_date || new Date(),
        end_date,
        description
      ];

      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật quy tắc
  static async update(ruleId, ruleData) {
    try {
      const {
        role_id,
        min_sales,
        max_sales,
        commission_rate,
        product_category,
        start_date,
        end_date,
        description
      } = ruleData;

      const query = `
        UPDATE commission_rules 
        SET 
          role_id = $1,
          min_sales = $2,
          max_sales = $3,
          commission_rate = $4,
          product_category = $5,
          start_date = $6,
          end_date = $7,
          description = $8
        WHERE rule_id = $9
        RETURNING *
      `;
      
      const values = [
        role_id,
        min_sales || 0,
        max_sales,
        commission_rate,
        product_category,
        start_date,
        end_date,
        description,
        ruleId
      ];

      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Xóa quy tắc
  static async delete(ruleId) {
    try {
      const query = 'DELETE FROM commission_rules WHERE rule_id = $1 RETURNING *';
      const result = await db.query(query, [ruleId]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Lấy danh sách roles
  static async getRoles() {
    try {
      const query = 'SELECT * FROM roles ORDER BY role_name';
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Lấy danh sách product categories
  static async getProductCategories() {
    try {
      const query = 'SELECT * FROM product_categories ORDER BY category_name';
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Kiểm tra xung đột quy tắc
  static async checkConflict(ruleData, excludeRuleId = null) {
    try {
      const {
        role_id,
        min_sales,
        max_sales,
        product_category,
        start_date,
        end_date
      } = ruleData;

      let query = `
        SELECT * FROM commission_rules 
        WHERE role_id = $1 
        AND product_category = $2
        AND (
          (start_date <= $4 AND (end_date IS NULL OR end_date >= $3)) OR
          (start_date <= $3 AND (end_date IS NULL OR end_date >= $4)) OR
          ($3 <= start_date AND ($4 IS NULL OR $4 >= start_date))
        )
        AND (
          (min_sales <= $6 AND (max_sales IS NULL OR max_sales >= $5)) OR
          (min_sales <= $5 AND (max_sales IS NULL OR max_sales >= $6)) OR
          ($5 <= min_sales AND ($6 IS NULL OR $6 >= min_sales))
        )
      `;

      const values = [
        role_id,
        product_category,
        start_date,
        end_date || start_date,
        min_sales,
        max_sales
      ];

      if (excludeRuleId) {
        query += ' AND rule_id != $7';
        values.push(excludeRuleId);
      }

      const result = await db.query(query, values);
      return result.rows.length > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = CommissionRule;
