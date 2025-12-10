const productService = require("../medusaBSP_services/BSP_product_service");

async function getProducts(req, res) {
  try {
    const data = await productService.getAllProducts();
    res.json(data);
  } catch (err) {
    console.error("Lỗi controller:", err.message);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getProducts };
