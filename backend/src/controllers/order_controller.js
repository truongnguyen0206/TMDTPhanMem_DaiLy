const Order = require("../models/order_model");
const referralService = require("../services/order_service");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const { safeEmit } = require("../realtime/socket");

// ========================
// 🟩 LẤY TOÀN BỘ ĐƠN HÀNG
// ========================
const getAll = async (req, res) => {
  try {
    const data = await Order.getAll();
    res.json(data);
  } catch (err) {
    console.error("❌ Error in getAll orders:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ========================
// 🟦 LẤY DANH SÁCH (TỪ VIEW)
// ========================
const list = async (req, res) => {
  try {
    const { limit, offset, user_id, from, to } = req.query;
    const data = await Order.listOrders({
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
      user_id,
      from,
      to,
    });
    res.json(data);
  } catch (err) {
    console.error("❌ Error in list orders:", err);
    res.status(500).json({ message: err.message });
  }
};

// // ========================
// // 🟧 LẤY ĐƠN HÀNG THEO CỘNG TÁC VIÊN
// // ========================
// const getOrdersByCollaborator = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const orders = await Order.getByCollaboratorId(id);

//     if (!orders || orders.length === 0) {
//       return res.status(404).json({ message: "❌ Không tìm thấy đơn hàng nào cho cộng tác viên này." });
//     }

//     return res.status(200).json({
//       message: "✅ Lấy danh sách đơn hàng theo cộng tác viên thành công!",
//       data: orders,
//     });
//   } catch (error) {
//     console.error("❌ Lỗi trong getOrdersByCollaborator:", error);
//     return res.status(500).json({ message: "Lỗi server!", error: error.message });
//   }
// };

// // ========================
// // 🟦 LẤY ĐƠN HÀNG THEO KHÁCH HÀNG
// // ========================
// const getOrdersByCustomer = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const orders = await Order.getByCustomerId(id);

//     if (!orders || orders.length === 0) {
//       return res.status(404).json({ message: "❌ Không tìm thấy đơn hàng nào cho khách hàng này." });
//     }

//     return res.status(200).json({
//       message: "✅ Lấy danh sách đơn hàng theo khách hàng thành công!",
//       data: orders,
//     });
//   } catch (error) {
//     console.error("❌ Lỗi trong getOrdersByCustomer:", error);
//     return res.status(500).json({ message: "Lỗi server!", error: error.message });
//   }
// };

const getOrdersByUser = async (req, res) => {
  try {
    const { user_id, role_id } = req.query; // GET /api/orders/byUser?user_id=5&role_id=3
    const orders = await Order.getByUser(user_id, role_id);

    if (!orders.length) {
      return res.status(404).json({ message: "❌ Không có đơn hàng nào phù hợp." });
    }

    return res.status(200).json({
      message: "✅ Lấy danh sách đơn hàng theo user thành công!",
      data: orders,
    });
  } catch (error) {
    console.error("❌ Lỗi trong getOrdersByUser:", error);
    return res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};

// // ========================
// // 🟨 LẤY 1 ĐƠN HÀNG (KÈM ITEMS)
// // ========================
// const getOne = async (req, res) => {
//   try {
//     const order = await Order.getOrderById(req.params.id);
//     if (!order) return res.status(404).json({ message: "Order not found" });
//     res.json(order);
//   } catch (err) {
//     console.error("❌ Error in getOne order:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

// ========================
// 🟧 TẠO ĐƠN HÀNG
// ========================
const create = async (req, res) => {
  try {
    const {
      order_date,
      total_amount,
      created_by,
      customer_id,
      order_source,
      order_status,
      payment_status,
      product
    } = req.body;

    // Validate cơ bản
    if (!order_source) {
      return res.status(400).json({ message: "order_source is required" });
    }
    if (order_source === "agent" && !agent_id) {
      return res.status(400).json({ message: "agent_id required for order_source=agent" });
    }
    if (order_source === "ctv" && !collaborator_id) {
      return res.status(400).json({ message: "collaborator_id required for order_source=ctv" });
    }

    let newOrder;
    if (Array.isArray(product) && items.length > 0) {
      // 🧾 Tạo order kèm items
      newOrder = await Order.createOrderWithItems({
        order: { order_date, total_amount, created_by, customer_id, order_source, order_status, payment_status },
        items,
      });
    } else {
      // 🧾 Tạo order đơn lẻ
      const insertId = await Order.create({
        order_date,
        total_amount,
        created_by,
        customer_id,
        order_source,
        order_status, 
        payment_status
      });
      newOrder = await Order.getOrderById(insertId);
    }

    // 🔥 Realtime: yêu cầu dashboard/đơn hàng refresh
    safeEmit('dashboard:invalidate', { entity: 'order', action: 'create', at: Date.now() });
    safeEmit('orders:changed', { action: 'create', at: Date.now() });

    res.status(201).json(newOrder);
  } catch (err) {
    console.error("❌ Error in create order:", err);
    res.status(500).json({ message: err.message });
  }
};

// ========================
// 🟩 CẬP NHẬT ĐƠN HÀNG
// ========================
const update = async (req, res) => {
  try {
    const updated = await Order.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: "Order not found" });

    // 🔥 Realtime
    safeEmit('dashboard:invalidate', { entity: 'order', action: 'update', id: req.params.id, at: Date.now() });
    safeEmit('orders:changed', { action: 'update', id: req.params.id, at: Date.now() });

    res.json(updated);
  } catch (err) {
    console.error("❌ Error in update order:", err);
    res.status(500).json({ message: err.message });
  }
};

// ========================
// 🟥 XÓA ĐƠN HÀNG
// ========================
const remove = async (req, res) => {
  try {
    await Order.remove(req.params.id);

    // 🔥 Realtime
    safeEmit('dashboard:invalidate', { entity: 'order', action: 'delete', id: req.params.id, at: Date.now() });
    safeEmit('orders:changed', { action: 'delete', id: req.params.id, at: Date.now() });

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("❌ Error in remove order:", err);
    res.status(500).json({ message: err.message });
  }
};

// ========================
// 🟦 XEM NGUỒN GỐC ĐƠN HÀNG
// ========================
const getOrigin = async (req, res) => {
  try {
    const order_code = req.params.code;

    // ✅ Gọi model để lấy chi tiết đơn hàng từ VIEW
    const data = await Order.getOrderDetail(order_code);

    if (!data) {
      return res.status(404).json({ message: `❌ Order ${order_code} không tồn tại.` });
    }

    let msg = "";
    const issues = [];

    // ✅ Logic xác định nguồn gốc đơn hàng
    // Giữ nguyên nhưng đổi key cho khớp với view (nguon_tao_don)
    if (data.nguon_tao_don === "Đại lý") {
      msg = `✅ Đơn ${data.ma_don_hang}: Phát sinh qua Đại lý (${data.nguoi_gioi_thieu || "Không rõ"})`;
    } else if (data.nguon_tao_don === "Cộng tác viên") {
      msg = `✅ Đơn ${data.ma_don_hang}: Phát sinh qua Cộng tác viên (${data.nguoi_gioi_thieu || "Không rõ"})`;
    } else if (data.nguon_tao_don) {
      msg = `⚠️ Đơn ${data.ma_don_hang}: Tạo từ nguồn ${data.nguon_tao_don}`;
    } else {
      msg = `⚠️ Đơn ${data.ma_don_hang}: Không xác định được nguồn tạo đơn.`;
      issues.push("Thiếu thông tin nguồn_tao_don");
    }

    // ✅ Trả kết quả về cho client
    res.json({
      message: msg,
      issues,
      order: data,
    });
  } catch (err) {
    console.error("❌ Lỗi trong getOrigin:", err);
    res.status(500).json({
      message: `Lỗi hệ thống khi truy xuất nguồn gốc đơn hàng.`,
      error: err.message,
    });
  }
};


// ========================
// 🟦 LẤY TOÀN BỘ NGUỒN GỐC ĐƠN HÀNG
// ========================
const getAllOrigin = async (req, res) => {
  try {
    const { limit, offset, user_id, from, to } = req.query;

    // 🔹 Dùng lại model listOrders() đã có (truy v_order_detail)
    const orders = await Order.listOrders({
      limit: limit ? parseInt(limit) : 10,
      offset: offset ? parseInt(offset) : 0,
      user_id,
      from,
      to,
    });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng nào." });
    }

    res.status(200).json({
      total: orders.length,
      data: orders,
    });
  } catch (err) {
    console.error("❌ Lỗi trong getAllOrigin:", err);
    res.status(500).json({
      message: "Lỗi hệ thống khi lấy nguồn gốc đơn hàng.",
      error: err.message,
    });
  }
};

// // ========================
// // 📊 XUẤT EXCEL
// // ========================
// const exportOrdersExcel = async (req, res) => {
//   try {
//     const { user_id, from, to } = req.query;
//     const orders = await Order.listOrders({ limit: 10000, offset: 0, user_id, from, to });

//     const workbook = new ExcelJS.Workbook();
//     const sheet = workbook.addWorksheet("Orders");

//     sheet.columns = [
//       { header: "Mã đơn hàng", key: "ma_don_hang", width: 15 },
//       { header: "Sản phẩm", key: "san_pham", width: 25 },
//       { header: "Số lượng", key: "so_luong", width: 10 },
//       { header: "Giá", key: "gia", width: 15 },
//       { header: "Tổng tiền", key: "tong_tien", width: 15 },
//       { header: "Trạng thái", key: "trang_thai", width: 15 },
//       { header: "Nguồn tạo đơn", key: "nguon_tao_don", width: 20 },
//       { header: "Người giới thiệu", key: "nguoi_gioi_thieu", width: 20 },
//       { header: "Ngày tạo", key: "tao_vao_luc", width: 20 },
//     ];

//     orders.forEach((o) => sheet.addRow(o));

//     res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
//     res.setHeader("Content-Disposition", `attachment; filename="orders_${Date.now()}.xlsx"`);
//     await workbook.xlsx.write(res);
//     res.end();
//   } catch (err) {
//     console.error("❌ Error exporting Excel:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

// // ========================
// // 📄 XUẤT PDF
// // ========================
// const exportOrdersPDF = async (req, res) => {
//   try {
//     const { user_id, from, to } = req.query;
//     const orders = await Order.listOrders({ limit: 10000, offset: 0, user_id, from, to });

//     const doc = new PDFDocument({ margin: 30, size: "A4" });
//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader("Content-Disposition", `attachment; filename="orders_${Date.now()}.pdf"`);
//     doc.pipe(res);

//     doc.fontSize(16).text("Orders Report", { align: "center" }).moveDown();

//     orders.forEach((o) => {
//       doc.fontSize(10).text(`Mã: ${o.ma_don_hang} | Sản phẩm: ${o.san_pham} | Tổng: ${o.tong_tien} | Nguồn: ${o.nguon_tao_don}`);
//       doc.moveDown(0.3);
//     });

//     doc.end();
//   } catch (err) {
//     console.error("❌ Error exporting PDF:", err);
//     res.status(500).json({ message: err.message });
//   }
// };


async function createReferral(req, res) {
  try {
    const { owner_id, owner_role_id } = req.body;

    const result = await referralService.createReferralLink(owner_id, owner_role_id);

    res.status(201).json({
      success: true,
      message: "Tạo link giới thiệu thành công",
      data: result
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
}


module.exports = {
  getAll,
  list,
  // getOrdersByCollaborator,
  // getOrdersByCustomer,
  getOrdersByUser,
  // getOne,
  create,
  update,
  remove,
  getOrigin,
  getAllOrigin,
  // exportOrdersExcel,
  // exportOrdersPDF,
  createReferral,
};
