const CommissionRule = require('../models/commissionRule.model');

class CommissionRuleService {
  // Lấy tất cả quy tắc hoa hồng
  static async getAllRules() {
    try {
      const rules = await CommissionRule.getAll();
      return {
        success: true,
        data: rules,
        message: 'Lấy danh sách quy tắc hoa hồng thành công'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: 'Lỗi khi lấy danh sách quy tắc hoa hồng: ' + error.message
      };
    }
  }

  // Lấy quy tắc theo ID
  static async getRuleById(ruleId) {
    try {
      if (!ruleId || isNaN(ruleId)) {
        return {
          success: false,
          data: null,
          message: 'ID quy tắc không hợp lệ'
        };
      }

      const rule = await CommissionRule.getById(ruleId);
      if (!rule) {
        return {
          success: false,
          data: null,
          message: 'Không tìm thấy quy tắc hoa hồng'
        };
      }

      return {
        success: true,
        data: rule,
        message: 'Lấy thông tin quy tắc hoa hồng thành công'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: 'Lỗi khi lấy thông tin quy tắc hoa hồng: ' + error.message
      };
    }
  }

  // Lấy quy tắc theo role
  static async getRulesByRole(roleId) {
    try {
      if (!roleId || isNaN(roleId)) {
        return {
          success: false,
          data: null,
          message: 'ID vai trò không hợp lệ'
        };
      }

      const rules = await CommissionRule.getByRole(roleId);
      return {
        success: true,
        data: rules,
        message: 'Lấy danh sách quy tắc hoa hồng theo vai trò thành công'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: 'Lỗi khi lấy danh sách quy tắc hoa hồng theo vai trò: ' + error.message
      };
    }
  }

  // Tạo quy tắc mới
  static async createRule(ruleData) {
    try {
      // Validate dữ liệu đầu vào
      const validation = this.validateRuleData(ruleData);
      if (!validation.isValid) {
        return {
          success: false,
          data: null,
          message: validation.message
        };
      }

      // Kiểm tra xung đột quy tắc
      const hasConflict = await CommissionRule.checkConflict(ruleData);
      if (hasConflict) {
        return {
          success: false,
          data: null,
          message: 'Quy tắc này xung đột với quy tắc đã tồn tại'
        };
      }

      const newRule = await CommissionRule.create(ruleData);
      return {
        success: true,
        data: newRule,
        message: 'Tạo quy tắc hoa hồng thành công'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: 'Lỗi khi tạo quy tắc hoa hồng: ' + error.message
      };
    }
  }

  // Cập nhật quy tắc
  static async updateRule(ruleId, ruleData) {
    try {
      if (!ruleId || isNaN(ruleId)) {
        return {
          success: false,
          data: null,
          message: 'ID quy tắc không hợp lệ'
        };
      }

      // Validate dữ liệu đầu vào
      const validation = this.validateRuleData(ruleData);
      if (!validation.isValid) {
        return {
          success: false,
          data: null,
          message: validation.message
        };
      }

      // Kiểm tra quy tắc có tồn tại không
      const existingRule = await CommissionRule.getById(ruleId);
      if (!existingRule) {
        return {
          success: false,
          data: null,
          message: 'Không tìm thấy quy tắc hoa hồng'
        };
      }

      // Kiểm tra xung đột quy tắc (loại trừ quy tắc hiện tại)
      const hasConflict = await CommissionRule.checkConflict(ruleData, ruleId);
      if (hasConflict) {
        return {
          success: false,
          data: null,
          message: 'Quy tắc này xung đột với quy tắc đã tồn tại'
        };
      }

      const updatedRule = await CommissionRule.update(ruleId, ruleData);
      return {
        success: true,
        data: updatedRule,
        message: 'Cập nhật quy tắc hoa hồng thành công'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: 'Lỗi khi cập nhật quy tắc hoa hồng: ' + error.message
      };
    }
  }

  // Xóa quy tắc
  static async deleteRule(ruleId) {
    try {
      if (!ruleId || isNaN(ruleId)) {
        return {
          success: false,
          data: null,
          message: 'ID quy tắc không hợp lệ'
        };
      }

      // Kiểm tra quy tắc có tồn tại không
      const existingRule = await CommissionRule.getById(ruleId);
      if (!existingRule) {
        return {
          success: false,
          data: null,
          message: 'Không tìm thấy quy tắc hoa hồng'
        };
      }

      const deletedRule = await CommissionRule.delete(ruleId);
      return {
        success: true,
        data: deletedRule,
        message: 'Xóa quy tắc hoa hồng thành công'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: 'Lỗi khi xóa quy tắc hoa hồng: ' + error.message
      };
    }
  }

  // Lấy danh sách roles và categories
  static async getDropdownData() {
    try {
      const [roles, categories] = await Promise.all([
        CommissionRule.getRoles(),
        CommissionRule.getProductCategories()
      ]);

      return {
        success: true,
        data: {
          roles,
          categories
        },
        message: 'Lấy dữ liệu dropdown thành công'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: 'Lỗi khi lấy dữ liệu dropdown: ' + error.message
      };
    }
  }

  // Validate dữ liệu quy tắc
  static validateRuleData(ruleData) {
    const {
      role_id,
      min_sales,
      max_sales,
      commission_rate,
      start_date,
      end_date
    } = ruleData;

    // Kiểm tra các trường bắt buộc
    if (!role_id || isNaN(role_id)) {
      return {
        isValid: false,
        message: 'Vai trò là bắt buộc và phải là số'
      };
    }

    if (!commission_rate || isNaN(commission_rate) || commission_rate < 0 || commission_rate > 100) {
      return {
        isValid: false,
        message: 'Tỷ lệ hoa hồng phải là số từ 0 đến 100'
      };
    }

    if (min_sales !== undefined && min_sales !== null && (isNaN(min_sales) || min_sales < 0)) {
      return {
        isValid: false,
        message: 'Doanh số tối thiểu phải là số không âm'
      };
    }

    if (max_sales !== undefined && max_sales !== null && (isNaN(max_sales) || max_sales < 0)) {
      return {
        isValid: false,
        message: 'Doanh số tối đa phải là số không âm'
      };
    }

    if (min_sales !== undefined && max_sales !== undefined && 
        min_sales !== null && max_sales !== null && 
        min_sales >= max_sales) {
      return {
        isValid: false,
        message: 'Doanh số tối thiểu phải nhỏ hơn doanh số tối đa'
      };
    }

    if (start_date && end_date && new Date(start_date) >= new Date(end_date)) {
      return {
        isValid: false,
        message: 'Ngày bắt đầu phải nhỏ hơn ngày kết thúc'
      };
    }

    return {
      isValid: true,
      message: 'Dữ liệu hợp lệ'
    };
  }
}

module.exports = CommissionRuleService;
