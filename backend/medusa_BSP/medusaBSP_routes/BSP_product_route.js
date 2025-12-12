const express = require("express");
const router = express.Router();
const productController = require("../medusaBSP_controllers/BSP_product_controller");

router.get("/", productController.getProducts);

module.exports = router;
