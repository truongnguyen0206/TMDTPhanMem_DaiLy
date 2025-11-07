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

const exportOrdersExcel = async (req, res) => {
  try {
    // 🟦 1. Lấy danh sách đơn hàng cơ bản
    const { data: orders, error } = await supabase
      .from("orders_view")
      .select("*")
      .order("order_date", { ascending: false });

    if (error) throw error;
    if (!orders || orders.length === 0)
      return res.status(404).json({ message: "Không có đơn hàng nào để xuất Excel" });

    // 🟦 2. Bổ sung tên khách hàng & sản phẩm
    const enriched = await Promise.all(
      orders.map(async (order) => {
        // 🔹 Lấy tên khách hàng
        const { data: cust } = await supabase
          .from("customer_view")
          .select("customer_name")
          .eq("customer_id", order.customer_id)
          .maybeSingle();

        // 🔹 Lấy tên sản phẩm theo product_id
        const { data: prod } = await supabase
          .from("product")
          .select("product_name")
          .eq("product_id", order.product_id)
          .maybeSingle();

        return {
          ...order,
          customer_name: cust?.customer_name || "-",
          product_name: prod?.product_name || "-",
        };
      })
    );

    // 🟦 3. Tạo workbook và worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Orders");

    // ==== HEADER CÔNG TY ====
    worksheet.mergeCells("A1", "G1");
    worksheet.getCell("A1").value = "CÔNG TY CỔ PHẦN AMIT GROUP";
    worksheet.getCell("A1").font = { bold: true, size: 14 };
    worksheet.getCell("A1").alignment = { horizontal: "center" };

    worksheet.mergeCells("A2", "G2");
    worksheet.getCell("A2").value =
      "Địa chỉ: Số 7, đường 7C, Khu đô thị An Phú An Khánh, Phường An Phú, TP Thủ Đức, TP HCM.";
    worksheet.getCell("A2").font = { size: 10 };
    worksheet.getCell("A2").alignment = { horizontal: "center" };

    worksheet.mergeCells("A3", "G3");
    worksheet.getCell("A3").value =
      "SĐT: 0123 456 789 | Website: www.abc.com | Email: contact@abc.com";
    worksheet.getCell("A3").font = { size: 10 };
    worksheet.getCell("A3").alignment = { horizontal: "center" };

    worksheet.addRow([]);

    // ==== TITLE BÁO CÁO ====
    worksheet.mergeCells("A5", "G5");
    worksheet.getCell("A5").value = "BÁO CÁO ĐƠN HÀNG";
    worksheet.getCell("A5").font = { bold: true, size: 16 };
    worksheet.getCell("A5").alignment = { horizontal: "center" };

    worksheet.addRow([]);

    // ==== HEADER CỘT ====
    worksheet.columns = [
      { header: "Mã đơn", key: "order_code", width: 15 },
      { header: "Ngày", key: "order_date", width: 20 },
      { header: "Khách hàng", key: "customer_name", width: 25 },
      { header: "Sản phẩm", key: "product_name", width: 25 },
      { header: "Nguồn", key: "order_source", width: 15 },
      { header: "Tổng tiền", key: "total_amount", width: 15 },
      { header: "Trạng thái", key: "status", width: 12 },
    ];

    // ==== DỮ LIỆU ====
    enriched.forEach((order) => {
      worksheet.addRow({
        order_code: order.order_code,
        order_date: order.order_date
          ? new Date(order.order_date).toLocaleDateString("vi-VN")
          : "-",
        customer_name: order.customer_name,
        product_name: order.product_name,
        order_source: order.order_source || "-",
        total_amount: order.total_amount || 0,
        status: order.status || "-",
      });
    });

    // ==== ĐỊNH DẠNG ====
    worksheet.getColumn("total_amount").numFmt = '#,##0 "₫"';
    worksheet.getColumn("order_date").alignment = { horizontal: "center" };
    worksheet.getColumn("status").alignment = { horizontal: "center" };

    // ==== DÒNG NGÀY XUẤT ====
    worksheet.addRow([]);
    const exportDateRow = worksheet.addRow([
      `Ngày xuất: ${new Date().toLocaleString("vi-VN")}`,
    ]);
    worksheet.mergeCells(`A${exportDateRow.number}:G${exportDateRow.number}`);
    exportDateRow.getCell(1).alignment = { horizontal: "right" };
    exportDateRow.getCell(1).font = { size: 10 };

    // ==== GỬI FILE EXCEL ====
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=orders.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("❌ Lỗi trong exportOrdersExcel:", err);
    res.status(500).json({ message: "Lỗi xuất Excel", error: err.message });
  }
};


const exportOrdersPDF = async (req, res) => {
  try {
    // 🟦 1. Lấy danh sách đơn hàng cơ bản
    const { data: orders, error } = await supabase
      .from("orders_view")
      .select("*")
      .order("order_date", { ascending: false });

    if (error) throw error;
    if (!orders || orders.length === 0)
      return res.status(404).json({ message: "Không có đơn hàng nào để xuất PDF" });

    // 🟦 2. Bổ sung dữ liệu khách hàng & sản phẩm
    const enriched = await Promise.all(
      orders.map(async (order) => {
        // Lấy tên khách hàng
        const { data: cust } = await supabase
          .from("customer_view")
          .select("customer_name")
          .eq("customer_id", order.customer_id) // ✅ sửa lỗi dấu ngoặc thừa
          .maybeSingle();

        // Lấy tên sản phẩm dựa trên product_id
        const { data: prod, error: prodErr} = await supabase
          .from("product")
          .select("product_name")
          .eq("product_id", order.product_id)
          .maybeSingle();

          console.log("🔸 Kết quả truy vấn product:", prod, prodErr);

        return {
          ...order,
          customer_name: cust?.customer_name || "-",
          product_name: prod?.product_name || "-",
        };
      })
    );

    // 🟦 3. Thiết lập header PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=orders.pdf");

    const fonts = {
      TimesNewRoman: {
        normal: path.join(__dirname, "../../public/fonts/times.ttf"),
        bold: path.join(__dirname, "../../public/fonts/timesbd.ttf"),
        italics: path.join(__dirname, "../../public/fonts/timesi.ttf"),
        bolditalics: path.join(__dirname, "../../public/fonts/timesbi.ttf"),
      },
    };

    const printer = new PDF(fonts);

    // 🟦 4. Định nghĩa layout PDF
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
              ...enriched.map((order) => [
                order.order_code,
                new Date(order.order_date).toLocaleDateString("vi-VN"),
                order.customer_name,
                order.order_source || "-",
                order.product_name, // ✅ hiển thị tên sản phẩm
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

    // 🟦 5. Xuất file PDF
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (err) {
    console.error("❌ Lỗi trong exportOrdersPDF:", err);
    res.status(500).json({ message: "Lỗi xuất PDF", error: err.message });
  }
};


module.exports = { getFilteredOrders, exportOrdersExcel, exportOrdersPDF };
