// controllers/report_controller.js
const reportService = require("../services/report_service");

const exportOrdersExcel = async (req, res) => {
  try {
    const { from, to } = req.query || {};
    const userId = req.params.user_id;

    const orders = await reportService.getOrdersForExport({ userId, from, to });

    if (!orders || orders.length === 0) {
      return res
        .status(404)
        .json({ message: "Không có đơn hàng nào để xuất Excel" });
    }

    const { buffer, filename } = await reportService.generateExcelReport({
      orders,
      from,
      to,
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );
    res.setHeader("Content-Length", buffer.length);

    return res.send(buffer);
  } catch (err) {
    console.error("❌ Lỗi exportOrdersExcel:", err);
    return res
      .status(500)
      .json({ message: "Lỗi xuất Excel", error: err.message });
  }
};

const exportOrdersPDF = async (req, res) => {
  try {
    const { from, to } = req.query || {};
    const userId = req.params.user_id;

    const orders = await reportService.getOrdersForExport({ userId, from, to });

    if (!orders || orders.length === 0) {
      return res
        .status(404)
        .json({ message: "Không có đơn hàng nào để xuất PDF" });
    }

    const { pdfDoc, filename } = reportService.generatePdfReport({
      orders,
      from,
      to,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );

    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (err) {
    console.error("❌ Lỗi trong exportOrdersPDF:", err);
    return res
      .status(500)
      .json({ message: "Lỗi xuất PDF", error: err.message });
  }
};

const exportOrdersCSV = async (req, res) => {
  try {
    const { from, to } = req.query || {};
    const userId = req.params.user_id;

    const orders = await reportService.getOrdersForExport({ userId, from, to });

    if (!orders || orders.length === 0) {
      return res
        .status(404)
        .json({ message: "Không có đơn hàng nào để xuất CSV" });
    }

    const { csvContent, filename } = reportService.generateCsvReport({
      orders,
      from,
      to,
    });

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );

    // BOM để Excel hiểu UTF-8 tiếng Việt
    return res.send("\ufeff" + csvContent);
  } catch (err) {
    console.error("❌ Lỗi exportOrdersCSV:", err);
    return res
      .status(500)
      .json({ message: "Lỗi xuất CSV", error: err.message });
  }
};

module.exports = {
  exportOrdersExcel,
  exportOrdersPDF,
  exportOrdersCSV,
};