const { getOrdersByDistributor } = require("../models/distributor_model");

/**
 * ✔ Service: Trả về danh sách đơn hàng theo nhà phân phối
 */
const fetchDistributorOrders = async (nppId) => {
  return await getOrdersByDistributor(nppId);
};

module.exports = {
  fetchDistributorOrders,
};