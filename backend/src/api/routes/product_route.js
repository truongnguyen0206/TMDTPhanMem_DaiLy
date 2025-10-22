const express = require("express");
const router = express.Router();
const productController = require("../../controllers/product_controller");

router.get("/getallproducts", productController.getAllOProducts);
router.post("/addProduct", productController.addProduct);
router.put("/updateProduct/:id", productController.updateProduct);
router.delete("/deleteProduct/:id", productController.deleteProduct);
router.get("/:order_id", productController.getProducts);

module.exports = router;
