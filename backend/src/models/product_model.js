const pool = require("../config/database_config");

// === Lấy toàn bộ sản phẩm trong tất cả đơn hàng ===
const getAllProducts = async () => {
    const result = await pool.query(
      "SELECT * FROM orders.order_product ORDER BY product_id ASC"
    );
    return result.rows;
  };
  

// === Thêm sản phẩm ===
const createOrderProduct = async (data) => {
  const {order_id, product_id, product_name, description, quantity, unit_price } = data;

  const result = await pool.query(
    `INSERT INTO orders.order_product 
      (order_id, product_id, product_name, description, quantity, unit_price)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [order_id, product_id, product_name, description, quantity, unit_price]
  );

  return result.rows[0];
};

// === Cập nhật sản phẩm ===
const updateOrderProduct = async (id, updates) => {
  // ✅ Chỉ cho phép cập nhật các cột hợp lệ
  const allowedFields = [
    "id",
    "product_name",
    "description",
    "quantity",
    "unit_price"
  ];

  // Lọc ra các key hợp lệ
  const keys = Object.keys(updates).filter((k) => allowedFields.includes(k));

  // Nếu không có trường hợp lệ → không update
  if (keys.length === 0) return null;

  // Tạo câu lệnh SET (vd: product_name = $1, quantity = $2)
  const setClauses = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");

  // Lấy danh sách giá trị theo thứ tự
  const values = keys.map((k) => updates[k]);

  // Đẩy id vào cuối mảng
  values.push(id);

  const query = `
    UPDATE orders.order_product
    SET ${setClauses}
    WHERE id = $${values.length}
    RETURNING *;
  `;

  const result = await pool.query(query, values);

  // Trả về dòng đã cập nhật hoặc null nếu không có
  return result.rowCount ? result.rows[0] : null;
};

// === Xóa sản phẩm ===
const deleteOrderProduct = async (id) => {
  const result = await pool.query(
    "DELETE FROM orders.order_product WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
};

// === Lấy danh sách sản phẩm theo order_id ===
const getProductsByOrder = async (order_id) => {
  const result = await pool.query(
    "SELECT * FROM orders.order_product WHERE order_id = $1 ORDER BY id ASC",
    [order_id]
  );
  return result.rows;
};

module.exports = {
    getAllProducts,
    createOrderProduct,
    updateOrderProduct,
    deleteOrderProduct,
    getProductsByOrder,
};
