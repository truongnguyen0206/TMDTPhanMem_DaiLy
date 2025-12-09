const express = require("express");
const router = express.Router();
const NPPController = require("../../controllers/distributor_controller");
// const {
//   getDistributorOrders,
// } = require("../../controllers/distributor_controller");

router.get("/", NPPController.getAllNPP);
// ✔ Route lấy danh sách đơn hàng
router.get("/tong_orders/:npp_id", NPPController.getDistributorOrders);

router.get("/danhsach-phanphoidaily/:npp_id", NPPController.getAgentsByNPP);

module.exports = router;
