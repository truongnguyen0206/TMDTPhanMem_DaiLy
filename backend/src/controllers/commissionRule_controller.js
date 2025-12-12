const CommissionRuleService = require('../services/commissionRule_service');

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

  // 4. Tạo quy tắc mới
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
      // console.log("🔑 [Controller] User from Token:", req.user);

      // Tự động gán người tạo
      if (req.user) {
          // 💡 Ưu tiên lấy req.user.id (UUID chuẩn Supabase)
          const adminId = req.user.id || req.user.user_id || req.user.userId;
          
          if (adminId) {
              ruleData.created_by = adminId;
              // console.log("✅ [Controller] Gán created_by =", adminId);
          } else {
              console.warn("⚠️ [Controller] Không tìm thấy ID trong req.user!");
          }
      }

      const result = await CommissionRuleService.createRule(ruleData);
      
      if (result.success) {
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
      // Lấy 'id' từ params
      const { id } = req.params; 
      const ruleId = id; 

      const ruleData = req.body;
      
      if (!ruleId) {
        return res.status(400).json({ success: false, message: 'Thiếu ID quy tắc.' });
      }

      // 💡 [ĐÃ SỬA]: Logic lấy User ID đồng bộ với hàm createRule
      // Database mới dùng UUID, nên phải lấy req.user.id
      if (req.user) {
         const adminId = req.user.id || req.user.user_id; // Ưu tiên UUID
         if (adminId) {
             ruleData.created_by = adminId;
         }
      }

      const result = await CommissionRuleService.updateRule(ruleId, ruleData);
      
      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
       console.error("Lỗi Controller updateRule:", error);
       return res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
    }
  }

  // 6. Xóa quy tắc
  static async deleteRule(req, res) {
    try {
      const ruleId = req.params.id; 
      
      if (!ruleId) {
        return res.status(400).json({ success: false, message: 'Thiếu ID quy tắc.' });
      }

      const result = await CommissionRuleService.deleteRule(ruleId);
      
      if (result.success) {
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