const { getOrdersByDistributor } = require("../models/distributor_model");
const NPPModel = require("../models/distributor_model");

const getAllNPP = async () => {
  try {
    const list = await NPPModel.getAllNPP();

    return {
      success: true,
      message: "Lấy danh sách nhà phân phối thành công",
      data: list,
    };
  } catch (error) {
    return {
      success: false,
      message: "Không thể lấy danh sách nhà phân phối",
      error: error.message,
    };
  }
};

/**
 * ✔ Service: Trả về danh sách đơn hàng theo nhà phân phối
 */
const fetchDistributorOrders = async (nppId) => {
  return await getOrdersByDistributor(nppId);
};

module.exports = {
  fetchDistributorOrders,
  getAllNPP,
};