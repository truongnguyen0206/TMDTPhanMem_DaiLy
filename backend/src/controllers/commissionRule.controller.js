const CommissionRuleService = require('../services/commissionRule.service');

class CommissionRuleController {
  // Lấy tất cả quy tắc hoa hồng
  static async getAllRules(req, res) {
    try {
      const result = await CommissionRuleService.getAllRules();
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        data: null,
        message: 'Lỗi server: ' + error.message
      });
    }
  }

  // Lấy quy tắc theo ID
  static async getRuleById(req, res) {
    try {
      const { ruleId } = req.params;
      const result = await CommissionRuleService.getRuleById(ruleId);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        data: null,
        message: 'Lỗi server: ' + error.message
      });
    }
  }

  // Lấy quy tắc theo role
  static async getRulesByRole(req, res) {
    try {
      const { roleId } = req.params;
      const result = await CommissionRuleService.getRulesByRole(roleId);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        data: null,
        message: 'Lỗi server: ' + error.message
      });
    }
  }

  // Tạo quy tắc mới
  static async createRule(req, res) {
    try {
      const ruleData = req.body;
      const result = await CommissionRuleService.createRule(ruleData);
      
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        data: null,
        message: 'Lỗi server: ' + error.message
      });
    }
  }

  // Cập nhật quy tắc
  static async updateRule(req, res) {
    try {
      const { ruleId } = req.params;
      const ruleData = req.body;
      const result = await CommissionRuleService.updateRule(ruleId, ruleData);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        data: null,
        message: 'Lỗi server: ' + error.message
      });
    }
  }

  // Xóa quy tắc
  static async deleteRule(req, res) {
    try {
      const { ruleId } = req.params;
      const result = await CommissionRuleService.deleteRule(ruleId);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        data: null,
        message: 'Lỗi server: ' + error.message
      });
    }
  }

  // Lấy dữ liệu dropdown (roles, categories)
  static async getDropdownData(req, res) {
    try {
      const result = await CommissionRuleService.getDropdownData();
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        data: null,
        message: 'Lỗi server: ' + error.message
      });
    }
  }

  // Lấy quy tắc áp dụng cho user cụ thể
  static async getApplicableRules(req, res) {
    try {
      const { userId } = req.params;
      const { currentSales, productCategory } = req.query;

      if (!userId || isNaN(userId)) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'ID người dùng không hợp lệ'
        });
      }

      // Lấy thông tin user và role
      const db = require('../config/db.config');
      const userQuery = 'SELECT u.*, r.role_name FROM users u JOIN roles r ON u.role_id = r.role_id WHERE u.user_id = $1';
      const userResult = await db.query(userQuery, [userId]);
      
      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          data: null,
          message: 'Không tìm thấy người dùng'
        });
      }

      const user = userResult.rows[0];
      const sales = parseFloat(currentSales) || 0;

      // Lấy quy tắc áp dụng
      const rulesQuery = `
        SELECT * FROM commission_rules 
        WHERE role_id = $1
        AND (product_category IS NULL OR product_category = $2)
        AND (min_sales IS NULL OR $3 >= min_sales)
        AND (max_sales IS NULL OR $3 < max_sales)
        AND (start_date IS NULL OR CURRENT_DATE >= start_date)
        AND (end_date IS NULL OR CURRENT_DATE <= end_date)
        ORDER BY commission_rate DESC
      `;
      
      const rulesResult = await db.query(rulesQuery, [user.role_id, productCategory, sales]);
      
      res.status(200).json({
        success: true,
        data: {
          user: user,
          currentSales: sales,
          applicableRules: rulesResult.rows,
          recommendedRule: rulesResult.rows[0] || null
        },
        message: 'Lấy quy tắc áp dụng thành công'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        data: null,
        message: 'Lỗi server: ' + error.message
      });
    }
  }
}

module.exports = CommissionRuleController;
