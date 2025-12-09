const CommissionRule = require('../models/commissionRule_model');

class CommissionRuleService {
  static async getAllRules() {
    try {
      const rules = await CommissionRule.getAll();
      return { success: true, data: rules, message: 'Lấy danh sách thành công' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  static async getRuleById(ruleId) {
    try {
      if (!ruleId) return { success: false, message: 'Thiếu ID' };
      const rule = await CommissionRule.getById(ruleId);
      if (!rule) return { success: false, message: 'Không tìm thấy' };
      return { success: true, data: rule };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  static async getRulesByRole(roleId) {
    try {
      if (!roleId) return { success: false, message: 'Thiếu Role ID' };
      const rules = await CommissionRule.getByRole(roleId);
      return { success: true, data: rules };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  static async createRule(ruleData) {
    try {
      const validation = this.validateRuleData(ruleData);
      if (!validation.isValid) return { success: false, message: validation.message };

      const conflict = await CommissionRule.checkConflict(ruleData);
      if (conflict) return { success: false, message: 'Quy tắc bị xung đột.' };

      const newRule = await CommissionRule.create(ruleData);
      return { success: true, data: newRule, message: 'Tạo thành công' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  static async updateRule(ruleId, ruleData) {
    try {
      if (!ruleId) return { success: false, message: 'Thiếu ID' };

      const validation = this.validateRuleData(ruleData);
      if (!validation.isValid) return { success: false, message: validation.message };

      const exist = await CommissionRule.getById(ruleId);
      if (!exist) return { success: false, message: 'Không tìm thấy quy tắc' };

      const conflict = await CommissionRule.checkConflict(ruleData, ruleId);
      if (conflict) return { success: false, message: 'Quy tắc bị xung đột.' };

      const updated = await CommissionRule.update(ruleId, ruleData);
      return { success: true, data: updated, message: 'Cập nhật thành công' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  static async deleteRule(ruleId) {
    try {
      if (!ruleId) return { success: false, message: 'Thiếu ID' };
      const exist = await CommissionRule.getById(ruleId); // Check tồn tại trước
      if (!exist) return { success: false, message: 'Không tìm thấy để xóa' };

      await CommissionRule.delete(ruleId);
      return { success: true, message: 'Xóa thành công' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  static async getDropdownData() {
    try {
      const roles = await CommissionRule.getRoles();
      return { success: true, data: { roles } };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Validation Logic
  static validateRuleData(ruleData = {}) {
    const { role_id, commission_rate, scope_type, max_commission_cap, status } = ruleData;

    if (!role_id) return { isValid: false, message: 'Thiếu role_id' };
    if (commission_rate === undefined || commission_rate < 0) return { isValid: false, message: 'Rate không hợp lệ' };

    if (scope_type && !['PRODUCT', 'CATEGORY', 'GLOBAL'].includes(scope_type)) 
        return { isValid: false, message: 'Scope Type sai' };
    
    if (status && !['Active', 'Inactive', 'Draft'].includes(status)) 
        return { isValid: false, message: 'Status sai' };

    if (max_commission_cap && commission_rate > max_commission_cap) 
        return { isValid: false, message: 'Rate vượt quá Max Cap' };

    return { isValid: true };
  }
}

module.exports = CommissionRuleService;