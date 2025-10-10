const express = require("express");
const router = express.Router();
const reportController = require("../../controllers/report_controller");

// Xuất Excel
router.get("/orders/excel", reportController.exportOrdersExcel);

// Xuất PDF
router.get("/orders/pdf", reportController.exportOrdersPDF);

module.exports = router;
