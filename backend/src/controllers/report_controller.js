const pool = require("../config/database_config");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");



// Lấy dữ liệu orders với filter
const getFilteredOrders = async (from, to) => {
  let query = "SELECT * FROM orders.orders";
  const params = [];

  if (from && to) {
    query += " WHERE order_date BETWEEN $1 AND $2";
    params.push(from, to);
  } else if (from) {
    query += " WHERE order_date >= $1";
    params.push(from);
  } else if (to) {
    query += " WHERE order_date <= $1";
    params.push(to);
  }

  query += " ORDER BY order_date DESC";

  const result = await pool.query(query, params);
  return result.rows;
};

// Xuất Excel
const exportOrdersExcel = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM orders.orders ORDER BY order_date DESC");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Orders");

    // header
    worksheet.columns = [
      { header: "Order Code", key: "order_code", width: 10 },
      { header: "Date", key: "order_date", width: 20 },
      { header: "Customer ID", key: "customer_id", width: 15 },
      { header: "Source", key: "order_source", width: 10 },
      { header: "Agent ID", key: "agent_id", width: 10 },
      { header: "Collaborator ID", key: "collaborator_id", width: 15 },
      { header: "Total", key: "total_amount", width: 15 },
      { header: "Status", key: "status", width: 10 },
    ];

    worksheet.addRows(result.rows);

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=orders.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi xuất Excel" });
  }
};

// Xuất PDF
const exportOrdersPDF = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM orders.orders ORDER BY order_date DESC");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=orders.pdf");

    const doc = new PDFDocument();
    doc.pipe(res);

    doc.fontSize(18).text("Orders Report", { align: "center" });
    doc.moveDown();

    result.rows.forEach((order) => {
      doc
        .fontSize(12)
        .text(
          `Code: ${order.order_code} | Date: ${order.order_date} | Customer: ${order.customer_id || "-"} | Source: ${order.order_source} | Total: ${order.total_amount} | Status: ${order.status}`
        );
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi xuất PDF" });
  }
};

module.exports = { getFilteredOrders, exportOrdersExcel, exportOrdersPDF };
