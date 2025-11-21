const { fetchDistributorOrders } = require("../services/distributor_service");

/**
 * ✔ Controller: Nhà phân phối xem danh sách đơn hàng
 */
const getDistributorOrders = async (req, res) => {
  try {
    const nppId = req.params.npp_id;

    if (!nppId)
      return res.status(400).json({
        success: false,
        message: "Thiếu npp_id",
      });

    const orders = await fetchDistributorOrders(nppId);

    return res.status(200).json({
      success: true,
      message: "Danh sách đơn hàng của nhà phân phối",
      data: orders,
    });
  } catch (err) {
    console.error("getDistributorOrders error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

module.exports = {
  getDistributorOrders,
};
