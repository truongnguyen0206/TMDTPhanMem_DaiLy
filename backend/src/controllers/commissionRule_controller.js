const CommissionRuleService = require('../services/commissionRule_service');
const { safeEmit } = require('../realtime/socket');

class CommissionRuleController {
  static async getAllRules(req, res) {
    const result = await CommissionRuleService.getAllRules();
    return res.status(result.success ? 200 : 400).json(result);
  }

  static async getRuleById(req, res) {
    const result = await CommissionRuleService.getRuleById(req.params.ruleId);
    return res.status(result.success ? 200 : 404).json(result);
  }

  static async getRulesByRole(req, res) {
    const result = await CommissionRuleService.getRulesByRole(req.params.roleId);
    return res.status(result.success ? 200 : 400).json(result);
  }

 // 4. Tạo quy tắc mới (Đã FIX lỗi created_by null)
  static async createRule(req, res) {
    try {
      const ruleData = req.body;
      
      // Kiểm tra body rỗng
      if (!ruleData || Object.keys(ruleData).length === 0) {
           return res.status(400).json({
               success: false,
               message: 'Dữ liệu đầu vào không được để trống.'
           });
      }
      
      // 🔍 DEBUG: In ra thông tin user từ token để kiểm tra
      console.log("🔑 [Controller] User from Token:", req.user);

      // Tự động gán người tạo
      if (req.user) {
          // 💡 FIX: Thử lấy ID từ các trường phổ biến (user_id, id, userId)
          const adminId = req.user.user_id || req.user.id || req.user.userId;
          
          if (adminId) {
              ruleData.created_by = adminId;
              console.log("✅ [Controller] Gán created_by =", adminId);
          } else {
              console.warn("⚠️ [Controller] Không tìm thấy ID trong req.user!");
          }
      }

      const result = await CommissionRuleService.createRule(ruleData);
      
      if (result.success) {
        safeEmit('dashboard:invalidate', { entity: 'commission_rule', action: 'create', at: Date.now() });
        return res.status(201).json(result);
      } else {
        return res.status(400).json(result);
      }

    } catch (error) {
      console.error("Lỗi Controller createRule:", error);
      return res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
    }
  }

  // 5. Cập nhật quy tắc
  static async updateRule(req, res) {
    try {
      // 💡 SỬA LỖI: Lấy 'id' từ params và gán vào biến ruleId
      const { id } = req.params; 
      const ruleId = id; // Hoặc dùng trực tiếp ruleId = req.params.id


      const ruleData = req.body;
      
      if (!ruleId) {
        return res.status(400).json({ success: false, message: 'Thiếu ID quy tắc.' });
      }

      // Tự động gán người sửa đổi
      if (req.user && req.user.user_id) {
          ruleData.created_by = req.user.user_id; 
      }

      const result = await CommissionRuleService.updateRule(ruleId, ruleData);
      
      if (result.success) {
        safeEmit('dashboard:invalidate', { entity: 'commission_rule', action: 'update', id: ruleId, at: Date.now() });
        return res.status(200).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      // ...
    }
  }

  // 6. Xóa quy tắc
  static async deleteRule(req, res) {
    try {
      // 💡 SỬA LỖI: Lấy 'id' từ URL thay vì 'ruleId'
      const ruleId = req.params.id; 
      
      if (!ruleId) {
        return res.status(400).json({ success: false, message: 'Thiếu ID quy tắc.' });
      }

      // Kiểm tra xem quy tắc có tồn tại không trước khi xóa (Optional nhưng recommended)
      // const existingRule = await CommissionRuleService.getRuleById(ruleId);
      // if (!existingRule.success) {
      //    return res.status(404).json({ success: false, message: 'Quy tắc không tồn tại.' });
      // }

      const result = await CommissionRuleService.deleteRule(ruleId);
      
      // Trả về kết quả
      if (result.success) {
        safeEmit('dashboard:invalidate', { entity: 'commission_rule', action: 'delete', id: ruleId, at: Date.now() });
        return res.status(200).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      console.error("Lỗi Controller deleteRule:", error);
      return res.status(500).json({
        success: false,
        data: null,
        message: 'Lỗi server: ' + error.message
      });
    }
  }
}

module.exports = CommissionRuleController;