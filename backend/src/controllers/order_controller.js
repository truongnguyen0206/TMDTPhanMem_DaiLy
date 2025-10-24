const Order = require("../models/order_model");
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
// const pool = require("../config/database_config");
const pool = require("../config/supabaseClient");

// Lấy all
const getAll = async (req, res) => {
  try {
    const rows = await Order.getAll();
    res.json(rows);
  } catch (err) {
    console.error("Error in getAll orders:", err);
    res.status(500).json({ message: "Server error" });
  }
}
// Lấy danh sách orders (kèm items)
const listOrders = async ({ limit, offset, agent_id, from, to }) => {
  let query = "SELECT * FROM orders.orders WHERE 1=1";
  const params = [];

  if (agent_id) {
    params.push(agent_id);
    query += ` AND agent_id = $${params.length}`;
  }

  if (from) {
    params.push(from);
    query += ` AND created_at >= $${params.length}`;
  }

  if (to) {
    params.push(to);
    query += ` AND created_at <= $${params.length}`;
  }

  params.push(limit, offset);
  query += ` ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

  const result = await pool.query(query, params);
  return result.rows;
};

const list = async (req, res) => {
  try {
    const { limit, offset, agent_id, from, to } = req.query;
    const rows = await Order.listOrders({
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
      agent_id,
      from,
      to,
    });
    res.json(rows);
  } catch (err) {
    console.error("Error in list orders:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// Lấy 1 order theo id (kèm items)
const getOne = async (req, res) => {
  try {
    const row = await Order.getOrderById(req.params.id);
    if (!row) return res.status(404).json({ message: "Order not found" });
    res.json(row);
  } catch (err) {
    console.error("Error in getOne order:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Tạo order (có thể kèm items)
const create = async (req, res) => {
  try {
    const { order_date, total_amount, created_by, customer_id, order_source, agent_id, collaborator_id, status, items } = req.body;

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
    if (Array.isArray(items) && items.length > 0) {
      // Tạo order kèm items
      newOrder = await Order.createOrderWithItems({
        order: { order_date, total_amount, created_by, customer_id, order_source, agent_id, collaborator_id, status },
        product_name,
      });
    } else {
      // Tạo order đơn lẻ
      const insertId = await Order.create({ order_date, total_amount, created_by, customer_id, order_source, agent_id, collaborator_id, status });
      newOrder = await Order.getOrderById(insertId);
    }

    res.status(201).json(newOrder);
  } catch (err) {
    console.error("Error in create order:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update order (chưa có update items)
const update = async (req, res) => {
  try {
    const updated = await Order.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: "Order not found" });
    res.json(updated);
  } catch (err) {
    console.error("Error in update order:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Xóa order
const remove = async (req, res) => {
  try {
    const affected = await Order.remove(req.params.id);
    if (affected === 0) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Error in remove order:", err);
    res.status(500).json({ message: "Server error" });
  }
};


const listWithOrigin = async (req, res) => {
  try {
    const { limit, offset, agent_id, from, to } = req.query;
    const rows = await Order.getOrdersWithOrigin({
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
      agent_id,
      from,
      to
    });
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const getOrigin = async (req, res) => {
  try {
    const order_code = req.params.code; // lấy từ URL: /orders/origin/:code
    const data = await Order.getOrderOrigin(order_code); // trả về tất cả cột liên quan từ view

    if (!data) {
      return res.status(404).json({ message: `❌ Order ${order_code}: Không tìm thấy đơn hàng.` });
    }

    let msg = '';
    const issues = [];

    // Xác định nguồn & mô tả giống SQL
    switch (data.order_source) {
      case 'customer':
        msg = `✅ Order ${data.order_code}: Phát sinh trực tiếp từ khách hàng (customer_id=${data.customer_id}, tên=${data.customer_name || data.cust_customer_name || 'Không rõ'})`;
        if (data.agent_id || data.collaborator_id || data.npp_id) 
          issues.push('Nguồn là customer nhưng có agent/npp/ctv gắn');
        break;

      case 'npp':
        msg = `✅ Order ${data.order_code}: Phát sinh qua Nhà phân phối (npp_id=${data.npp_id}, tên=${data.npp_name || 'Không rõ'})`;
        if (!data.npp_id || data.agent_id || data.collaborator_id)
          issues.push('Nguồn là npp nhưng agent/ctv gắn hoặc npp_id null');
        break;

      case 'agent':
        msg = `✅ Order ${data.order_code}: Phát sinh qua Đại lý (agent_id=${data.agent_id}, tên=${data.agent_name || 'Không rõ'})`;
        if (!data.agent_id || data.npp_id || data.collaborator_id)
          issues.push('Nguồn là agent nhưng agent_id null hoặc có npp/ctv gắn');
        break;

      case 'ctv':
        msg = `✅ Order ${data.order_code}: Phát sinh qua CTV (ctv_id=${data.collaborator_id}, tên=${data.ctv_name || 'Không rõ'}, agent_id=${data.agent_id})`;
        if (!data.collaborator_id || !data.agent_id || data.npp_id)
          issues.push('Nguồn là ctv nhưng collaborator_id null, agent_id null, hoặc npp_id gắn');
        break;

      default:
        msg = `⚠️ Order ${data.order_code}: Nguồn không hợp lệ (${data.order_source})`;
        issues.push('Nguồn không hợp lệ');
    }

    res.json({ message: msg, issues, order: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};



const exportOrdersExcel = async (req, res) => {
  try {
    const { agent_id, from, to } = req.query;
    const orders = await Order.listOrders({ limit: 10000, offset: 0, agent_id, from, to });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Orders');

    sheet.columns = [
      { header: 'Order Code', key: 'order_code', width: 10 },
      { header: 'Order Date', key: 'order_date', width: 20 },
      { header: 'Customer', key: 'customer_name', width: 25 },
      { header: 'Phone', key: 'customer_phone', width: 15 },
      { header: 'Source', key: 'order_source', width: 10 },
      { header: 'Agent ID', key: 'agent_id', width: 10 },
      { header: 'Total', key: 'total_amount', width: 15 }
    ];

    for (const o of orders) {
      sheet.addRow({
        order_code: o.order_code,
        order_date: o.order_date,
        customer_name: o.customer_name,
        customer_phone: o.customer_phone,
        order_source: o.order_source,
        agent_id: o.agent_id,
        total_amount: o.total_amount
      });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="orders_${Date.now()}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Export PDF (simple tabular)
const exportOrdersPDF = async (req, res) => {
  try {
    const { agent_id, from, to } = req.query;
    const orders = await Order.listOrders({ limit: 10000, offset: 0, agent_id, from, to });

    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="orders_${Date.now()}.pdf"`);

    doc.pipe(res);

    doc.fontSize(16).text('Orders Report', { align: 'center' });
    doc.moveDown();

    // header
    doc.fontSize(10);
    const tableTop = doc.y;
    const columns = [
      { label: 'Code', width: 40 },
      { label: 'Date', width: 120 },
      { label: 'Customer', width: 150 },
      { label: 'Phone', width: 90 },
      { label: 'Source', width: 60 },
      { label: 'Agent', width: 40 },
      { label: 'Total', width: 70 }
    ];

    // draw header
    let x = doc.page.margins.left;
    for (const col of columns) {
      doc.text(col.label, x, tableTop, { width: col.width, continued: false });
      x += col.width;
    }
    doc.moveDown(0.5);

    // rows
    for (const o of orders) {
      let x = doc.page.margins.left;
      doc.text(String(o.order_code), x, undefined, { width: columns[0].width }); x += columns[0].width;
      doc.text(String(o.order_date), x, undefined, { width: columns[1].width }); x += columns[1].width;
      doc.text(String(o.customer_name || ''), x, undefined, { width: columns[2].width }); x += columns[2].width;
      doc.text(String(o.customer_phone || ''), x, undefined, { width: columns[3].width }); x += columns[3].width;
      doc.text(String(o.order_source), x, undefined, { width: columns[4].width }); x += columns[4].width;
      doc.text(String(o.agent_id || ''), x, undefined, { width: columns[5].width }); x += columns[5].width;
      doc.text(String(o.total_amount || 0), x, undefined, { width: columns[6].width }); x += columns[6].width;
      doc.moveDown(0.2);
      if (doc.y > doc.page.height - 100) doc.addPage();
    }

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


module.exports = { getAll, listOrders, list, getOne, create, update, remove, listWithOrigin, getOrigin, exportOrdersExcel, exportOrdersPDF };
