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


// ================================
// XUẤT EXCEL ĐƠN HÀNG
// ================================
const exportOrdersExcel = async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from("v_order_detail")
      .select("*")
      .order("tao_vao_luc", { ascending: false });

    if (error) throw error;
    if (!orders || orders.length === 0)
      return res.status(404).json({ message: "Không có đơn hàng nào để xuất Excel" });

    const workbook = new ExcelJS.Workbook();

    // ================================
    // TÊN SHEET CÓ NGÀY XUẤT
    // ================================
    let sheetName;

    if (req.query.from && req.query.to) {
      sheetName = `Bao_cao_don_hang (${req.query.from} → ${req.query.to})`;
    } else {
      const exportDate = new Date().toLocaleDateString("vi-VN").replace(/\//g, "-");
      sheetName = `Bao_cao_don_hang - ${exportDate}`;
    }

    const worksheet = workbook.addWorksheet(sheetName);

    // ================================
    //   HEADER CÔNG TY
    // ================================
    worksheet.mergeCells("A1:H1");
    worksheet.getCell("A1").value = "CÔNG TY CỔ PHẦN AMIT GROUP";
    worksheet.getCell("A1").font = { bold: true, size: 14 };
    worksheet.getCell("A1").alignment = { horizontal: "center" };

    worksheet.mergeCells("A2:H2");
    worksheet.getCell("A2").value =
      "Địa chỉ: Số 7, đường 7C, Khu đô thị An Phú An Khánh, P. An Phú, TP Thủ Đức, TP.HCM.";
    worksheet.getCell("A2").font = { size: 10 };
    worksheet.getCell("A2").alignment = { horizontal: "center" };

    worksheet.mergeCells("A3:H3");
    worksheet.getCell("A3").value =
      "SĐT: 0123 456 789 | Website: www.abc.com | Email: contact@abc.com";
    worksheet.getCell("A3").font = { size: 10 };
    worksheet.getCell("A3").alignment = { horizontal: "center" };

    worksheet.addRow([]);

    // ================================
    //   TITLE BÁO CÁO
    // ================================
    worksheet.mergeCells("A5:H5");
    worksheet.getCell("A5").value = "BÁO CÁO ĐƠN HÀNG";
    worksheet.getCell("A5").font = { bold: true, size: 16 };
    worksheet.getCell("A5").alignment = { horizontal: "center" };

    // ================================
    //  Dòng “Từ ngày – Đến ngày”
    // ================================
    const exportRange =
      req.query.from && req.query.to
        ? `Từ ngày: ${req.query.from}    Đến ngày: ${req.query.to}`
        : `Ngày xuất: ${new Date().toLocaleString("vi-VN")}`;

    worksheet.mergeCells("A6:H6");
    worksheet.getCell("A6").value = exportRange;
    worksheet.getCell("A6").font = { size: 10 };
    worksheet.getCell("A6").alignment = { horizontal: "left" };

    worksheet.addRow([]);

    // ================================
    // TẠO HEADER BẢNG (KHÔNG ĐƯỢC DÙNG worksheet.columns)
    // ================================
    const headerRow = worksheet.addRow([
      "Mã đơn",
      "Ngày",
      "Khách hàng",
      "Nguồn",
      "Sản phẩm",
      "Tổng tiền",
      "Trạng thái đơn hàng",
      "Trạng thái thanh toán",
    ]);

    // Set width cho 8 cột
    const colWidths = [15, 15, 25, 20, 25, 18, 25, 25];
    colWidths.forEach((w, idx) => {
      worksheet.getColumn(idx + 1).width = w;
    });

    // ==== Format header ====
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD9D9D9" }, // xám nhạt
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // ================================
    //  DỮ LIỆU
    // ================================
    orders.forEach((order) => {
      worksheet.addRow([
        order.ma_don_hang,
        order.tao_vao_luc
          ? new Date(order.tao_vao_luc).toLocaleDateString("vi-VN")
          : "-",
        order.ten_khach_hang,
        order.nguon_tao_don || "-",
        order.san_pham,
        order.tong_tien || 0,
        order.trang_thai_don_hang || "-",
        order.trang_thai_thanh_toan || "-",
      ]);
    });

    // Format số tiền
    worksheet.getColumn(6).numFmt = '#,##0 "₫"';

    // Căn giữa cột ngày
    worksheet.getColumn(2).alignment = { horizontal: "center" };
    worksheet.getColumn(8).alignment = { horizontal: "center" };

    // ================================
    // FOOTER
    // ================================
    worksheet.addRow([]);
    const footerRow = worksheet.addRow([
      "AMIT GROUP - THỰC TẬP SINH ĐẠI HỌC HOA SEN",
    ]);

    worksheet.mergeCells(`A${footerRow.number}:H${footerRow.number}`);
    footerRow.getCell(1).alignment = { horizontal: "right" };
    footerRow.getCell(1).font = { size: 10, italic: true };

    // ================================
    // TRẢ FILE
    // ================================
    let filename = "";

    if (req.query.from && req.query.to) {
      const fromClean = req.query.from.replace(/\//g, "-");
      const toClean = req.query.to.replace(/\//g, "-");
      filename = `Bao_cao_don_hang-(${fromClean}→${toClean})`;
    } else {
      const exportDate = new Date().toLocaleDateString("vi-VN").replace(/\//g, "-");
      filename = `Bao_cao_don_hang-(${exportDate})`;
    }
    
    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}.xlsx"`
    );
    res.setHeader("Content-Length", buffer.length);
    
    return res.send(buffer);

  } catch (err) {
    console.error("❌ Lỗi exportOrdersExcel:", err);
    res.status(500).json({ message: "Lỗi xuất Excel", error: err.message });
  }
};


// =============================
//  XUẤT FILE PDF ĐƠN HÀNG
// =============================
const exportOrdersPDF = async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from("v_order_detail")
      .select("*")
      .order("tao_vao_luc", { ascending: false });

    if (error) throw error;
    if (!orders || orders.length === 0)
      return res.status(404).json({ message: "Không có đơn hàng nào để xuất PDF" });

    const enriched = orders;

    // =============================
    //  CHIA THÀNH TỪNG NHÓM 10 DÒNG
    // =============================
    const chunkSize = 10;
    const chunks = [];
    for (let i = 0; i < enriched.length; i += chunkSize) {
      chunks.push(enriched.slice(i, i + chunkSize));
    }

    // =============================
    //  CẤU HÌNH PDF
    // =============================
    let filename = "";

    if (req.query.from && req.query.to) {
      const fromClean = req.query.from.replace(/\//g, "-");
      const toClean = req.query.to.replace(/\//g, "-");
      filename = `Bao_cao_don_hang-(${fromClean}→${toClean}).pdf`;
    } else {
      const exportDate = new Date().toLocaleDateString("vi-VN").replace(/\//g, "-");
      filename = `Bao_cao_don_hang-(${exportDate}).pdf`;
    }

    const fonts = {
      TimesNewRoman: {
        normal: path.join(__dirname, "../../public/fonts/times.ttf"),
        bold: path.join(__dirname, "../../public/fonts/timesbd.ttf"),
        italics: path.join(__dirname, "../../public/fonts/timesi.ttf"),
        bolditalics: path.join(__dirname, "../../public/fonts/timesbi.ttf"),
      },
    };

    const printer = new PDF(fonts);

    // =============================
    //  CONTENT CHO TOÀN BỘ PDF
    // =============================
    const content = [];

    // ----- HEADER CHỈ XUẤT HIỆN 1 LẦN -----
    content.push({
      columns: [
        { image: path.join(__dirname, "../../public/logo.png"), width: 80 },
        [
          { text: "CÔNG TY CỔ PHẦN AMIT GROUP", style: "headerRight" },
          {
            text: "Địa chỉ: Số 7, đường 7C, Khu đô thị An Phú An Khánh, P. An Phú, TP Thủ Đức, TP.HCM.",
            style: "subTextRight",
          },
          { text: "SĐT: 0123 456 789", style: "subTextRight" },
          { text: "Website: www.abc.com", style: "subTextRight" },
          { text: "Email: contact@abc.com", style: "subTextRight" },
        ],
      ],
    });

    content.push({ text: "\n\nBÁO CÁO ĐƠN HÀNG", style: "title" });
    content.push({ text: "\n" });
    content.push({
      text:
        req.query.from && req.query.to
          ? `Từ ngày: ${req.query.from}    Đến ngày: ${req.query.to}`
          : `Ngày xuất: ${new Date().toLocaleString("vi-VN")}`,
      margin: [0, 5, 0, 15], // căn khoảng cách dưới title
      alignment: "left",
      fontSize: 10,
    });
    content.push({ text: "\n" });

    // =============================
    //  TẠO TỪNG BẢNG 10 DÒNG
    // =============================
    chunks.forEach((chunk, index) => {
      const tableBody = [
        [
          { text: "Mã đơn", bold: true },
          { text: "Ngày", bold: true },
          { text: "Khách hàng", bold: true },
          { text: "Nguồn", bold: true },
          { text: "Sản phẩm", bold: true },
          { text: "Tổng tiền", bold: true },
          { text: "Trạng thái đơn hàng", bold: true },
          { text: "Trạng thái thanh toán", bold: true },
        ],
        ...chunk.map((order) => [
          order.ma_don_hang,
          new Date(order.tao_vao_luc).toLocaleDateString("vi-VN"),
          order.ten_khach_hang,
          order.nguon_tao_don || "-",
          order.san_pham,
          (order.tong_tien || 0).toLocaleString("vi-VN") + " ₫",
          order.trang_thai_don_hang || "-",
          order.trang_thai_thanh_toan || "-",
        ]),
      ];

      content.push({
        table: {
          headerRows: 1,
          widths: ["*", "*", "*", "*", "*", "*", "*", "*"],
          body: tableBody,
        },
        layout: "lightHorizontalLines",
        // Xuống trang sau bảng trừ bảng cuối
        pageBreak: index < chunks.length - 1 ? "after" : undefined,
        margin: [0, 0, 0, 20],
      });
    });

    // ----- FOOTER -----
    content.push({
      text: "AMIT GROUP - THỰC TẬP SINH ĐẠI HỌC HOA SEN",
      alignment: "right",
      fontSize: 9,
    });

    // =============================
    //  PDF DOCUMENT
    // =============================
    const docDefinition = {
      pageMargins: [40, 60, 40, 60],
      defaultStyle: { font: "TimesNewRoman" },
      content,
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
    console.error("❌ Lỗi trong exportOrdersPDF:", err);
    res.status(500).json({ message: "Lỗi xuất PDF", error: err.message });
  }
};




module.exports = { getFilteredOrders, exportOrdersExcel, exportOrdersPDF };
