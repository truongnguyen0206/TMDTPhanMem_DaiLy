const { fetchDistributorOrders } = require("../services/distributor_service");
const NPPService = require("../services/distributor_service");

const getAllNPP = async (req, res) => {
  const result = await NPPService.getAllNPP();
  return res.status(result.success ? 200 : 400).json(result);
};

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

async function getAgentsByNPP(req, res) {
  const { npp_id } = req.params;

  if (!npp_id) {
    return res.status(400).json({
      success: false,
      message: "Thiếu npp_id",
    });
  }

  const result = await NPPService.listAgentsByNPP(npp_id);

  if (!result.success) {
    return res.status(400).json(result);
  }

  return res.status(200).json(result);
}

module.exports = {
  getDistributorOrders,
  getAllNPP,
  getAgentsByNPP,
};
