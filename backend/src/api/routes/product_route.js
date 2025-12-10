const express = require("express");
const router = express.Router();
const productController = require("../../controllers/product_controller");
const { authenticateToken } = require('../../middlewares/auth_middleware');

router.get("/getallproducts", productController.getAllOProducts);
router.post("/addProduct", productController.addProduct);
router.post("/create-link-product", productController.createLinkProduct); 
router.put("/updateProduct/:id", productController.updateProduct);
router.delete("/deleteProduct/:id", productController.deleteProduct);
router.put("/disable/:referral_code", productController.disableLinkProduct);
router.get("/:order_id", productController.getProducts);


module.exports = router;
