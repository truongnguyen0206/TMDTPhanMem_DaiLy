// services/report_service.js
const ExcelJS = require("exceljs");
const PDF = require("pdfmake");
const path = require("path");
const reportModel = require("../models/report_model");

// ---- Helpers chung cho tên sheet / file / dòng ngày ----
const buildExportRangeText = (from, to) => {
  if (from && to) {
    return `Từ ngày: ${from}    Đến ngày: ${to}`;
  }
  return `Ngày xuất: ${new Date().toLocaleString("vi-VN")}`;
};

const buildSheetName = (from, to) => {
  if (from && to) {
    return `Bao_cao_don_hang (${from} → ${to})`;
  }
  const exportDate = new Date().toLocaleDateString("vi-VN").replace(/\//g, "-");
  return `Bao_cao_don_hang - ${exportDate}`;
};

const buildFileNameBase = (from, to) => {
  if (from && to) {
    const fromClean = from.replace(/\//g, "-");
    const toClean = to.replace(/\//g, "-");
    return `Bao_cao_don_hang-(${fromClean}→${toClean})`;
  }
  const exportDate = new Date().toLocaleDateString("vi-VN").replace(/\//g, "-");
  return `Bao_cao_don_hang-(${exportDate})`;
};

// ---- Lấy đơn hàng theo user + role + ngày (y hệt buildOrderDetailQuery cũ) ----
const getOrdersForExport = async ({ userId, from, to }) => {
  if (!userId) {
    throw new Error("Thiếu user_id trong params!");
  }

  // 1️⃣ User + role
  const { data: userInfo, error: userError } = await reportModel.getUserWithRole(
    userId
  );
  if (userError || !userInfo) {
    throw new Error("Không tìm thấy user hoặc role.");
  }

  const { data: roleInfo } = await reportModel.getRoleNameById(
    userInfo.role_id
  );
  const roleName = roleInfo?.role_name || "Unknown";

  //
  // QUY TẮC:
  // Admin → tất cả
  // Đại lý → user + CTV thuộc đại lý
  // CTV → user
  //
  let allowedUserIds = [Number(userId)];
  let isAdmin = false;

  // 2️⃣ Admin
  if (roleName === "Admin") {
    isAdmin = true;
  }

  // 3️⃣ Đại lý → lấy thêm CTV
  if (roleName === "Đại lý") {
    const { data: agentInfo } = await reportModel.getAgentByUserId(userId);
    const realAgentId = agentInfo?.agent_id;

    const { data: ctvList, error: ctvError } =
      await reportModel.getCtvListByAgentId(realAgentId);

    console.log("realAgentId:", realAgentId);
    console.log("CTV list:", ctvList);
    console.log("CTV Query Error:", ctvError || null);

    const ctvIds = (ctvList || []).map((c) => c.user_id);
    allowedUserIds = [...allowedUserIds, ...ctvIds];
  }

  // 4️⃣ CTV → allowedUserIds giữ nguyên

  const { data, error } = await reportModel.getOrdersFromView({
    allowedUserIds,
    from,
    to,
    isAdmin,
  });

  if (error) {
    throw error;
  }

  return data || [];
};

// (nếu cần JSON thuần)
const getFilteredOrders = async ({ from, to }) => {
  const { data, error } = await reportModel.getFilteredOrders(from, to);
  if (error) throw error;
  return data || [];
};

// ---- Tạo Excel: GIỮ NGUYÊN FORM như file gốc ----
const generateExcelReport = async ({ orders, from, to }) => {
  const workbook = new ExcelJS.Workbook();

  // Tên sheet giống y chang
  const sheetName = buildSheetName(from, to);
  const worksheet = workbook.addWorksheet(sheetName);

  // // HEADER CÔNG TY
  // worksheet.mergeCells("A1:H1");
  // worksheet.getCell("A1").value = "CÔNG TY CỔ PHẦN AMIT GROUP";
  // worksheet.getCell("A1").font = { bold: true, size: 14 };
  // worksheet.getCell("A1").alignment = { horizontal: "center" };

  // worksheet.mergeCells("A2:H2");
  // worksheet.getCell("A2").value =
  //   "Địa chỉ: Số 7, đường 7C, Khu đô thị An Phú An Khánh, P. An Phú, TP Thủ Đức, TP.HCM.";
  // worksheet.getCell("A2").font = { size: 10 };
  // worksheet.getCell("A2").alignment = { horizontal: "center" };

  // worksheet.mergeCells("A3:H3");
  // worksheet.getCell("A3").value =
  //   "SĐT: 0123 456 789 | Website: www.abc.com | Email: contact@abc.com";
  // worksheet.getCell("A3").font = { size: 10 };
  // worksheet.getCell("A3").alignment = { horizontal: "center" };

  // worksheet.addRow([]);

  // HEADER TRƯỜNG ĐẠI HỌC HOA SEN
  worksheet.mergeCells("A1:H1");
  worksheet.getCell("A1").value = "TRƯỜNG ĐẠI HỌC HOA SEN";
  worksheet.getCell("A1").font = { bold: true, size: 14 };
  worksheet.getCell("A1").alignment = { horizontal: "center" };

  worksheet.mergeCells("A2:H2");
  worksheet.getCell("A2").value =
    "Trụ sở chính: 08 Nguyễn Văn Tráng, Phường Bến Thành, TP.Hồ Chí Minh";
  worksheet.getCell("A2").font = { size: 10 };
  worksheet.getCell("A2").alignment = { horizontal: "center" };

  worksheet.mergeCells("A3:H3");
  worksheet.getCell("A3").value =
    "Khoa Công Nghệ | Ngành: Công Nghệ Thông Tin | Website: https://www.hoasen.edu.vn";
  worksheet.getCell("A3").font = { size: 10 };
  worksheet.getCell("A3").alignment = { horizontal: "center" };

  worksheet.addRow([]);

  // TITLE BÁO CÁO
  worksheet.mergeCells("A5:H5");
  worksheet.getCell("A5").value = "BÁO CÁO ĐƠN HÀNG";
  worksheet.getCell("A5").font = { bold: true, size: 16 };
  worksheet.getCell("A5").alignment = { horizontal: "center" };

  // Dòng “Từ ngày – Đến ngày” hoặc “Ngày xuất”
  const exportRange = buildExportRangeText(from, to);
  worksheet.mergeCells("A6:H6");
  worksheet.getCell("A6").value = exportRange;
  worksheet.getCell("A6").font = { size: 10 };
  worksheet.getCell("A6").alignment = { horizontal: "left" };

  worksheet.addRow([]);

  // HEADER BẢNG
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

  const colWidths = [15, 15, 25, 20, 25, 18, 25, 25];
  colWidths.forEach((w, idx) => {
    worksheet.getColumn(idx + 1).width = w;
  });

  headerRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD9D9D9" },
    };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // DATA
  const totalOrders = Array.isArray(orders) ? orders.length : 0;
  const totalAmount = (orders || []).reduce((sum, order) => {
    const value = Number(order?.tong_tien);
    return sum + (Number.isFinite(value) ? value : 0);
  }, 0);

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

  worksheet.getColumn(6).numFmt = '#,##0 "₫"';
  worksheet.getColumn(2).alignment = { horizontal: "center" };
  worksheet.getColumn(8).alignment = { horizontal: "center" };

  // ===== SUMMARY =====
  worksheet.addRow([]);
  const styleSummaryRow = (row) => {
    row.height = 20;

    const cell = row.getCell(1);
    cell.font = { bold: true };
    cell.alignment = {
      horizontal: "left",
      vertical: "middle",
      wrapText: false,
    };

    // border rất nhẹ (có thể bỏ nếu muốn)
    cell.border = {
      bottom: { style: "hair" },
    };
  };

  // Tổng số đơn
  const totalOrderRow = worksheet.addRow([
    `Tổng số đơn hàng: ${totalOrders}`,
  ]);
  worksheet.mergeCells(
    `A${totalOrderRow.number}:B${totalOrderRow.number}`
  );
  styleSummaryRow(totalOrderRow);

  // Tổng doanh thu
  const totalAmountFormatted = totalAmount.toLocaleString("vi-VN") + " đ";
  const totalAmountRow = worksheet.addRow([
    `Tổng doanh thu: ${totalAmountFormatted}`,
  ]);
  worksheet.mergeCells(
    `A${totalAmountRow.number}:B${totalAmountRow.number}`
  );
  styleSummaryRow(totalAmountRow);


  // FOOTER
  worksheet.addRow([]);
  // const footerRow = worksheet.addRow(["AMIT GROUP - THỰC TẬP SINH"]);
  const footerRow = worksheet.addRow(["HSU - TÔN TRỌNG SỰ KHÁC BIỆT"]);
  worksheet.mergeCells(`A${footerRow.number}:H${footerRow.number}`);
  footerRow.getCell(1).alignment = { horizontal: "right" };
  footerRow.getCell(1).font = { size: 10, italic: true };

  const buffer = await workbook.xlsx.writeBuffer();
  const filenameBase = buildFileNameBase(from, to);

  return {
    buffer,
    filename: `${filenameBase}.xlsx`,
  };
};

// ---- Tạo PDF: GIỮ NGUYÊN FORM như file gốc ----
const generatePdfReport = ({ orders, from, to }) => {
  const enriched = orders;
  const totalOrders = Array.isArray(enriched) ? enriched.length : 0;
  const totalAmount = (enriched || []).reduce((sum, order) => {
    const value = Number(order?.tong_tien);
    return sum + (Number.isFinite(value) ? value : 0);
  }, 0);
  const chunkSize = 10;
  const chunks = [];

  for (let i = 0; i < enriched.length; i += chunkSize) {
    chunks.push(enriched.slice(i, i + chunkSize));
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
  const content = [];

  // // HEADER CÔNG TY
  // content.push({
  //   columns: [
  //     { image: path.join(__dirname, "../../public/logo.png"), width: 80 },
  //     [
  //       { text: "CÔNG TY CỔ PHẦN AMIT GROUP", style: "headerRight" },
  //       {
  //         text: "Địa chỉ: Số 7, đường 7C, Khu đô thị An Phú An Khánh, P. An Phú, TP Thủ Đức, TP.HCM.",
  //         style: "subTextRight",
  //       },
  //       { text: "SĐT: 0123 456 789", style: "subTextRight" },
  //       { text: "Website: www.abc.com", style: "subTextRight" },
  //       { text: "Email: contact@abc.com", style: "subTextRight" },
  //     ],
  //   ],
  // });

  // HEADER TRƯỜNG ĐẠI HỌC HOA SEN
  content.push({
    columns: [
      {
        image: path.join(__dirname, "../../public/logo2.png"),
        width: 150,
      },
      [
        {
          text: "TRƯỜNG ĐẠI HỌC HOA SEN",
          style: "headerRight",
          margin: [0, 0, 0, 6],
        },
        {
          text: "Trụ sở chính: 08 Nguyễn Văn Tráng, Phường Bến Thành, TP.Hồ Chí Minh",
          style: "subTextRight",
          margin: [0, 0, 0, 6],
        },
        {
          text: "Khoa Công Nghệ",
          style: "subTextRight",
          margin: [0, 0, 0, 6],
        },
        {
          text: "Ngành: Công Nghệ Thông Tin",
          style: "subTextRight",
          margin: [0, 0, 0, 6],
        },
        {
          text: "Website: https://www.hoasen.edu.vn",
          style: "subTextRight",
          margin: [0, 0, 0, 6],
        },
      ],
    ],
  });

  content.push({ text: "\n\nBÁO CÁO ĐƠN HÀNG", style: "title" });
  content.push({ text: "\n" });

  content.push({
    text: buildExportRangeText(from, to),
    margin: [0, 5, 0, 15],
    alignment: "left",
    fontSize: 10,
  });
  content.push({ text: "\n" });

  // Mỗi bảng 10 dòng
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
      pageBreak: index < chunks.length - 1 ? "after" : undefined,
      margin: [0, 0, 0, 20],
    });
  });

  // ===== SUMMARY =====
  content.push({
    stack: [
      {
        text: `Tổng số đơn hàng: ${totalOrders}`,
        bold: true,
        fontSize: 11,
        margin: [0, 2, 0, 2],
      },
      {
        text: `Tổng doanh thu: ${totalAmount.toLocaleString("vi-VN")} ₫`,
        bold: true,
        fontSize: 11,
        margin: [0, 2, 0, 6],
      },
    ],
  });

  // FOOTER
  content.push({
    text: "HSU - TÔN TRỌNG SỰ KHÁC BIỆT",
    alignment: "right",
    fontSize: 9,
    italics: true,
  });

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
  const filenameBase = buildFileNameBase(from, to);

  return {
    pdfDoc,
    filename: `${filenameBase}.pdf`,
  };
};

// ---- Tạo CSV: cấu trúc CỘT giống Excel ----
const generateCsvReport = ({ orders, from, to }) => {
  const header = [
    "Mã đơn",
    "Ngày",
    "Khách hàng",
    "Nguồn",
    "Sản phẩm",
    "Tổng tiền",
    "Trạng thái đơn hàng",
    "Trạng thái thanh toán",
  ];

  const rows = orders.map((order) => [
    order.ma_don_hang,
    order.tao_vao_luc
      ? new Date(order.tao_vao_luc).toLocaleDateString("vi-VN")
      : "-",
    order.ten_khach_hang || "",
    order.nguon_tao_don || "-",
    order.san_pham || "",
    order.tong_tien || 0,
    order.trang_thai_don_hang || "",
    order.trang_thai_thanh_toan || "",
  ]);

  const csvBody = [
    header.join(","),
    ...rows.map((r) =>
      r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  // ✅ BOM để Excel đọc đúng UTF-8 tiếng Việt
  const csvContent = "\ufeff" + csvBody;

  const filenameBase = buildFileNameBase(from, to);

  return {
    csvContent,
    filename: `${filenameBase}.csv`,
  };
};

module.exports = {
  getOrdersForExport,
  getFilteredOrders,
  generateExcelReport,
  generatePdfReport,
  generateCsvReport,
};
