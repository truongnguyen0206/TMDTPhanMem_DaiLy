const OrderProduct = require("../models/product_model");

// === Lấy tất cả sản phẩm trong toàn bộ hệ thống ===
const getAllOProducts = async (req, res) => {
    try {
      const data = await OrderProduct.getAllProducts();
      res.json(data);
    } catch (err) {
      console.error("❌ Lỗi lấy tất cả sản phẩm:", err);
      res.status(500).json({ message: "Lỗi khi lấy danh sách sản phẩm." });
    }
  };  

// === Tạo sản phẩm trong đơn hàng ===
const addProduct = async (req, res) => {
  try {
    const data = req.body;

    const newProduct = await OrderProduct.createOrderProduct(data);
    res.status(201).json(newProduct);
  } catch (err) {
    console.error("❌ Lỗi thêm sản phẩm:", err);
    res.status(500).json({ message: "Lỗi khi thêm sản phẩm." });
  }
};

// === Cập nhật sản phẩm trong đơn hàng ===
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = await OrderProduct.updateOrderProduct(id, updates);
    if (!updated)
      return res.status(404).json({ message: `Không tìm thấy sản phẩm id ${id}` });

    res.json(updated);
  } catch (err) {
    console.error("❌ Lỗi cập nhật:", err);
    res.status(500).json({ message: "Lỗi khi cập nhật sản phẩm." });
  }
};

// === Xóa sản phẩm trong đơn hàng ===
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await OrderProduct.deleteOrderProduct(id);
    if (!deleted)
      return res.status(404).json({ message: `Không tìm thấy sản phẩm id ${id}` });

    res.json({ message: "Đã xóa sản phẩm khỏi đơn hàng.", deleted });
  } catch (err) {
    console.error("❌ Lỗi xóa:", err);
    res.status(500).json({ message: "Lỗi khi xóa sản phẩm." });
  }
};

// === Lấy sản phẩm theo order_id ===
const getProducts = async (req, res) => {
  try {
    const { order_id } = req.params;
    const data = await OrderProduct.getProductsByOrder(order_id);
    res.json(data);
  } catch (err) {
    console.error("❌ Lỗi lấy dữ liệu:", err);
    res.status(500).json({ message: "Lỗi khi lấy danh sách sản phẩm." });
  }
};

module.exports = {
    getAllOProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getProducts,
};
