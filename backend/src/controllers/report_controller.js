const supabase = require("../config/supabaseClient");
const ExcelJS = require("exceljs");
const PDF = require("pdfmake");
const path = require("path");

// ===============================
// LẤY DỮ LIỆU VỚI FILTER
// ===============================
const getFilteredOrders = async (from, to) => {
  let query = supabase.from("orders.orders").select("*");

  if (from && to) {
    query = query.gte("order_date", from).lte("order_date", to);
  } else if (from) {
    query = query.gte("order_date", from);
  } else if (to) {
    query = query.lte("order_date", to);
  }

  query = query.order("order_date", { ascending: false });

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

// ===============================
// XUẤT EXCEL
// ===============================
const exportOrdersExcel = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("orders_view")
      .select("*")
      .order("order_date", { ascending: false });

    if (error) throw error;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Orders");

    // ==== HEADER CÔNG TY ====
    worksheet.mergeCells("A1", "F1");
    worksheet.getCell("A1").value = "CÔNG TY CỔ PHẦN AMIT GROUP";
    worksheet.getCell("A1").font = { bold: true, size: 14 };
    worksheet.getCell("A1").alignment = { horizontal: "center" };

    worksheet.mergeCells("A2", "F2");
    worksheet.getCell("A2").value =
      "Địa chỉ: Số 7, đường 7C, Khu đô thị An Phú An Khánh, Phường An Phú, TP Thủ Đức, TP HCM.";
    worksheet.getCell("A2").font = { size: 10 };
    worksheet.getCell("A2").alignment = { horizontal: "center" };

    worksheet.mergeCells("A3", "F3");
    worksheet.getCell("A3").value =
      "SĐT: 0123 456 789 | Website: www.abc.com | Email: contact@abc.com";
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
    data.forEach((order) => {
      worksheet.addRow({
        order_code: order.order_code,
        order_date: order.order_date
          ? new Date(order.order_date).toLocaleDateString("vi-VN")
          : "-",
        customer_name: order.customer_name || "-",
        product_name: order.product_name || "-",
        order_source: order.order_source || "-",
        total_amount: order.total_amount || 0,
        status: order.status || "-",
      });
    });

    worksheet.getColumn("total_amount").numFmt = '#,##0 "₫"';
    worksheet.getColumn("order_date").alignment = { horizontal: "center" };
    worksheet.getColumn("status").alignment = { horizontal: "center" };

    worksheet.addRow([]);
    const exportDateRow = worksheet.addRow([
      `Ngày xuất: ${new Date().toLocaleString("vi-VN")}`,
    ]);
    worksheet.mergeCells(`A${exportDateRow.number}:F${exportDateRow.number}`);
    exportDateRow.getCell(1).alignment = { horizontal: "right" };
    exportDateRow.getCell(1).font = { size: 10 };

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=orders.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi xuất Excel", error: err.message });
  }
};

// ===============================
// XUẤT PDF
// ===============================
const exportOrdersPDF = async (req, res) => {
  try {
    const { data, error } = await supabase// 👈 chỉ rõ schema
    .from("orders_view")
    .select("*")
    .order("order_date", { ascending: false });

    if (error) throw error;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=orders.pdf");

    const fonts = {
      TimesNewRoman: {
        normal: path.join(__dirname, "../../public/fonts/times.ttf"),
        bold: path.join(__dirname, "../../public/fonts/timesbd.ttf"),
        italics: path.join(__dirname, "../../public/fonts/timeis-Italic.ttf"),
        bolditalics: path.join(__dirname, "../../public/fonts/timesbi.ttf"),
      },
    };

    const printer = new PDF(fonts);

    const docDefinition = {
      pageMargins: [40, 60, 40, 60],
      defaultStyle: { font: "TimesNewRoman" },
      content: [
        {
          columns: [
            { image: path.join(__dirname, "../../public/logo.png"), width: 80 },
            [
              { text: "CÔNG TY CỔ PHẦN AMIT GROUP", style: "headerRight" },
              {
                text: "Địa chỉ: Số 7, đường 7C, Khu đô thị An Phú An Khánh, Phường An Phú, TP Thủ Đức, TP HCM.",
                style: "subTextRight",
              },
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
              ...data.map((order) => [
                order.order_code,
                new Date(order.order_date).toLocaleDateString("vi-VN"),
                order.customer_name || "-",
                order.order_source || "-",
                order.product_name || "-",
                (order.total_amount || 0).toLocaleString("vi-VN") + " ₫",
                order.status || "-",
              ]),
            ],
          },
          layout: "lightHorizontalLines",
        },
        {
          text: "\nNgày xuất: " + new Date().toLocaleString("vi-VN"),
          alignment: "right",
          fontSize: 9,
        },
      ],
      styles: {
        headerRight: { fontSize: 14, bold: true, alignment: "right" },
        subTextRight: { fontSize: 10, alignment: "right" },
        title: { fontSize: 18, bold: true, alignment: "center" },
      },
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi xuất PDF", error: err.message });
  }
};

module.exports = { getFilteredOrders, exportOrdersExcel, exportOrdersPDF };
