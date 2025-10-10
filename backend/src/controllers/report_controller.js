const pool = require("../config/database_config");
const ExcelJS = require("exceljs");
const PDF = require("pdfmake");
const path = require("path");



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

    // ==== HEADER CÔNG TY ====
    worksheet.mergeCells("A1", "F1");
    worksheet.getCell("A1").value = "CÔNG TY CỔ PHẦN AMIT GROUP";
    worksheet.getCell("A1").font = { bold: true, size: 14 };
    worksheet.getCell("A1").alignment = { horizontal: "center" };

    worksheet.mergeCells("A2", "F2");
    worksheet.getCell("A2").value = "Địa chỉ: Số 7, đường 7C, Khu đô thị An Phú An Khánh, Phường An Phú, TP Thủ Đức, TP HCM.";
    worksheet.getCell("A2").font = { size: 10 };
    worksheet.getCell("A2").alignment = { horizontal: "center" };

    worksheet.mergeCells("A3", "F3");
    worksheet.getCell("A3").value = "SĐT: 0123 456 789 | Website: www.abc.com | Email: contact@abc.com";
    worksheet.getCell("A3").font = { size: 10 };
    worksheet.getCell("A3").alignment = { horizontal: "center" };

    worksheet.addRow([]); // dòng trống

    // ==== TITLE BÁO CÁO ====
    worksheet.mergeCells(`A5`, `F5`);
    worksheet.getCell(`A5`).value = "BÁO CÁO ĐƠN HÀNG";
    worksheet.getCell(`A5`).font = { bold: true, size: 16 };
    worksheet.getCell(`A5`).alignment = { horizontal: "center" };

    worksheet.addRow([]);

    // ==== HEADER CỘT ====
    worksheet.columns = [
      { header: "Mã đơn", key: "order_code", width: 15 },
      { header: "Ngày", key: "order_date", width: 20 },
      { header: "Khách hàng", key: "customer_name", width: 25 },
      { header: "Sản phẩm", key: "product_name", width: 25 },
      { header: "Nguồn", key: "order_source", width: 15 },
      { header: "Tổng tiền", key: "total_amount", width: 15 },
      { header: "Trạng thái", key: "status", width: 10 },
    ];

    // ==== DỮ LIỆU ====
    result.rows.forEach(order => {
      worksheet.addRow({
        order_code: order.order_code,
        order_date: order.order_date ? new Date(order.order_date).toLocaleDateString("vi-VN") : "-",
        customer_name: order.customer_name || "-",
        product_name: order.product_name || "-",
        order_source: order.order_source,
        total_amount: order.total_amount || 0,
        status: order.status || "-",
      });
    });

    // ==== ĐỊNH DẠNG ====
    worksheet.getColumn("total_amount").numFmt = '#,##0 "₫"'; // tiền Việt
    worksheet.getColumn("order_date").alignment = { horizontal: "center" };
    worksheet.getColumn("status").alignment = { horizontal: "center" };

    // ==== NGÀY XUẤT ====
    worksheet.addRow([]);
    const exportDateRow = worksheet.addRow([`Ngày xuất: ${new Date().toLocaleString("vi-VN")}`]);
    worksheet.mergeCells(`A${exportDateRow.number}:F${exportDateRow.number}`);
    exportDateRow.getCell(1).alignment = { horizontal: "right" };
    exportDateRow.getCell(1).font = { size: 10 };

    // ==== XUẤT FILE ====
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

    // === FONT (Times New Roman trong thư mục dự án) ===
    const fonts = {
      TimesNewRoman: {
        normal: path.join(__dirname, "../../public/fonts/times.ttf"),
        bold: path.join(__dirname, "../../public/fonts/timesbd.ttf"),
        italics: path.join(__dirname, "../../public/fonts/timeis-Italic.ttf"),
        bolditalics: path.join(__dirname, "../../public/fonts/timesbi.ttf"),
      },
    };

    const printer = new PDF(fonts);

    // === TẠO NỘI DUNG PDF ===
    const docDefinition = {
      pageMargins: [40, 60, 40, 60],
      defaultStyle: {
        font: "TimesNewRoman", // dùng font tùy chỉnh
      },
      content: [
        {
          columns: [
            {
              image: path.join(__dirname, "../../public/logo.png"),
              width: 80,
            },
            [
              { text: "CÔNG TY CỔ PHẦN AMIT GROUP", style: "headerRight" },
              { text: "Địa chỉ: Số 7, đường 7C, Khu đô thị An Phú An Khánh, Phường An Phú, TP Thủ Đức, TP HCM.", style: "subTextRight" },
              { text: "SĐT: 0123 456 789", style: "subTextRight" },
              { text: "Website: www.abc.com", style: "subTextRight" },
              { text: "Email: contact@abc.com", style: "subTextRight" },
            ],
          ],
        },
        { text: "\n\nBÁO CÁO ĐƠN HÀNG", style: "title" },
        { text: "\n" },
        {
          table: {
            headerRows: 1,
            widths: ["*", "*", "*", "*", "*", "*", "*"],
            body: [
              [
                { text: "Mã đơn", bold: true },
                { text: "Ngày", bold: true },
                { text: "Khách hàng", bold: true },
                { text: "Nguồn", bold: true },
                { text: "Sản phẩm", bold: true },
                { text: "Tổng tiền", bold: true },
                { text: "Trạng thái", bold: true },
              ],
              ...result.rows.map(order => [
                order.order_code,
                new Date(order.order_date).toLocaleDateString("vi-VN"),
                order.customer_name || "-",
                order.order_source,
                order.product_name,
                (order.total_amount || 0).toLocaleString("vi-VN") + " ₫",
                order.status || "-",
              ]),
            ],
          },
          layout: "lightHorizontalLines",
        },
        { text: "\nNgày xuất: " + new Date().toLocaleString("vi-VN"), alignment: "right", fontSize: 9 },
      ],
      styles: {
        headerRight: { fontSize: 14, bold: true, alignment: "right" },
        subTextRight: { fontSize: 10, alignment: "right" },
        title: { fontSize: 18, bold: true, alignment: "center" },
      },
    };

    // === TẠO FILE PDF ===
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi xuất PDF" });
  }
};


module.exports = { getFilteredOrders, exportOrdersExcel, exportOrdersPDF };
