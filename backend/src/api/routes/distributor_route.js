const express = require("express");
const router = express.Router();

const {
  getDistributorOrders,
} = require("../../controllers/distributor_controller");

// ✔ Route lấy danh sách đơn hàng
router.get("/tong_orders/:npp_id", getDistributorOrders);

module.exports = router;
