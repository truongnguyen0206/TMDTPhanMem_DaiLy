const express = require("express");
const router = express.Router();
const orderController = require("../../controllers/order_controller");

router.get("/all", orderController.getAll);
// router.get("/", orderController.list);
router.get("/:id", orderController.getOne);
router.post("/createOrder", orderController.create);
router.put("/updateOrder/:id", orderController.update);
router.delete("/remove/:id", orderController.remove);

router.get('/with-origin', orderController.listWithOrigin);      // GET /api/order/with-origin
router.get('/origin/:code', orderController.getOrigin);            // GET /api/order/123/origin

router.get('/export/excel', orderController.exportOrdersExcel);
router.get('/export/pdf', orderController.exportOrdersPDF);

module.exports = router;
