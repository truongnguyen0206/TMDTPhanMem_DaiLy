const express = require("express");
const router = express.Router();
const orderController = require("../../controllers/order_controller");

router.get("/all", orderController.getAll);
// router.get("/", orderController.list);
// router.get("/:id", orderController.getOne);
// Tạo link giới thiệu
router.post("/createOrderLink", orderController.createReferral);
router.post("/createOrder", orderController.create);
router.put("/updateOrder/:id", orderController.update);
router.delete("/remove/:id", orderController.remove);

router.get('/with-origin', orderController.list);    
router.get("/origin/all", orderController.getAllOrigin);  // GET /api/order/with-origin
router.get('/origin/:code', orderController.getOrigin);            // GET /api/order/123/origin


// // 🟧 LẤY ĐƠN HÀNG THEO CỘNG TÁC VIÊN
// router.get("/collaborator/:id", orderController.getOrdersByCollaborator);

// // 🟦 LẤY ĐƠN HÀNG THEO KHÁCH HÀNG
// router.get("/customer/:id", orderController.getOrdersByCustomer);

router.get("/byUser", orderController.getOrdersByUser);


// router.get('/export/excel', orderController.exportOrdersExcel);
// router.get('/export/pdf', orderController.exportOrdersPDF);

module.exports = router;