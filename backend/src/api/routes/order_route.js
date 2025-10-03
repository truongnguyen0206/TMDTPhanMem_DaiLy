const express = require("express");
const router = express.Router();
const orderController = require("../../controllers/order_controller");

router.get("/all", orderController.getAll);
// router.get("/", orderController.list);
router.get("/:id", orderController.getOne);
router.post("/create", orderController.create);
router.put("/:id", orderController.update);
router.delete("/:id", orderController.remove);

router.get('/with-origin', orderController.listWithOrigin);      // GET /api/order/with-origin
router.get('/:id/origin', orderController.getOrigin);            // GET /api/order/123/origin


router.get('/export/excel', orderController.exportOrdersExcel);
router.get('/export/pdf', orderController.exportOrdersPDF);

module.exports = router;
