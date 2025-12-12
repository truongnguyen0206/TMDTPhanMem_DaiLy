const express = require("express");
const router = express.Router();
const reportController = require("../../controllers/report_controller");
const { authenticateToken } = require('../../middlewares/auth_middleware');

// Xuất Excel
router.get("/orders/excel/:user_id", authenticateToken, reportController.exportOrdersExcel);

// Xuất PDF
router.get("/orders/pdf/:user_id", authenticateToken, reportController.exportOrdersPDF);

// Xuất CSV
router.get("/orders/csv/:user_id", authenticateToken, reportController.exportOrdersCSV);

module.exports = router;
