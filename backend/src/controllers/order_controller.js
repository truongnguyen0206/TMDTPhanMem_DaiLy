const Order = require("../models/order_model");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");

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

// ========================
// 🟨 LẤY 1 ĐƠN HÀNG (KÈM ITEMS)
// ========================
const getOne = async (req, res) => {
  try {
    const order = await Order.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    console.error("❌ Error in getOne order:", err);
    res.status(500).json({ message: err.message });
  }
};

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
      status,
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
        order: { order_date, total_amount, created_by, customer_id, order_source, status },
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
        status,
      });
      newOrder = await Order.getOrderById(insertId);
    }

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
    const data = await Order.getOrderDetail(order_code);

    if (!data) {
      return res.status(404).json({ message: `❌ Order ${order_code} not found.` });
    }

    let msg = "";
    const issues = [];

    switch (data.trang_thai) {
      case "Đại lý":
        msg = `✅ Order ${data.ma_don_hang}: Phát sinh qua Đại lý (${data.nguoi_gioi_thieu || "Không rõ"})`;
        break;
      case "Cộng tác viên":
        msg = `✅ Order ${data.ma_don_hang}: Phát sinh qua CTV (${data.nguoi_gioi_thieu || "Không rõ"})`;
        break;
      default:
        msg = `⚠️ Order ${data.ma_don_hang}: Nguồn ${data.nguon_tao_don}`;
        break;
    }

    res.json({ message: msg, issues, order: data });
  } catch (err) {
    console.error("❌ Error in getOrigin:", err);
    res.status(500).json({ message: err.message });
  }
};

// ========================
// 📊 XUẤT EXCEL
// ========================
const exportOrdersExcel = async (req, res) => {
  try {
    const { user_id, from, to } = req.query;
    const orders = await Order.listOrders({ limit: 10000, offset: 0, user_id, from, to });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Orders");

    sheet.columns = [
      { header: "Mã đơn hàng", key: "ma_don_hang", width: 15 },
      { header: "Sản phẩm", key: "san_pham", width: 25 },
      { header: "Số lượng", key: "so_luong", width: 10 },
      { header: "Giá", key: "gia", width: 15 },
      { header: "Tổng tiền", key: "tong_tien", width: 15 },
      { header: "Trạng thái", key: "trang_thai", width: 15 },
      { header: "Nguồn tạo đơn", key: "nguon_tao_don", width: 20 },
      { header: "Người giới thiệu", key: "nguoi_gioi_thieu", width: 20 },
      { header: "Ngày tạo", key: "tao_vao_luc", width: 20 },
    ];

    orders.forEach((o) => sheet.addRow(o));

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="orders_${Date.now()}.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("❌ Error exporting Excel:", err);
    res.status(500).json({ message: err.message });
  }
};

// ========================
// 📄 XUẤT PDF
// ========================
const exportOrdersPDF = async (req, res) => {
  try {
    const { user_id, from, to } = req.query;
    const orders = await Order.listOrders({ limit: 10000, offset: 0, user_id, from, to });

    const doc = new PDFDocument({ margin: 30, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="orders_${Date.now()}.pdf"`);
    doc.pipe(res);

    doc.fontSize(16).text("Orders Report", { align: "center" }).moveDown();

    orders.forEach((o) => {
      doc.fontSize(10).text(`Mã: ${o.ma_don_hang} | Sản phẩm: ${o.san_pham} | Tổng: ${o.tong_tien} | Nguồn: ${o.nguon_tao_don}`);
      doc.moveDown(0.3);
    });

    doc.end();
  } catch (err) {
    console.error("❌ Error exporting PDF:", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAll,
  list,
  getOne,
  create,
  update,
  remove,
  getOrigin,
  exportOrdersExcel,
  exportOrdersPDF,
};
