// src/services/agent_product_service.js
const AgentProductModel = require("../models/agent_model");

const getAgentProducts = async (agent_id) => {
  try {
    const products = await AgentProductModel.getProductsByAgent(agent_id);

    return {
      success: true,
      message: "Lấy danh sách sản phẩm đã phân phối cho đại lý thành công",
      data: products,
    };
  } catch (error) {
    return {
      success: false,
      message: "Lỗi truy vấn",
      error: error.message,
    };
  }
};

module.exports = {
  getAgentProducts,
};
