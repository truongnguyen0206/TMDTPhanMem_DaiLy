// File: api/routes/commissionRule_route.js

const express = require('express');
const router = express.Router();
const commissionRuleController = require('../../controllers/commissionRule_controller');
// Giả sử bạn cũng cần xác thực cho các route này
const { authenticateToken } = require('../../middlewares/auth_middleware'); 

// Áp dụng middleware xác thực cho tất cả các route bên dưới
// router.use(authenticateToken); 

router.get("/", commissionRuleController.getAllCommissionRules);
router.get("/:id", commissionRuleController.getCommissionRuleById);
router.post("/", commissionRuleController.createCommissionRule);
router.put("/:id", commissionRuleController.updateCommissionRule);
router.delete("/:id", commissionRuleController.deleteCommissionRule);

module.exports = router;