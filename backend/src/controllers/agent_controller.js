const Agent = require('../models/agent_model');
const { getCTVByAgent } = require("../models/agent_model");

// 🟩 Tạo agent mới
const createAgent = async (req, res) => {
  try {
    const { user_id, agent_name, diachi, masothue } = req.body;

    if (!agent_name) {
      return res.status(400).json({ error: "⚠️ Thiếu tên đại lý (agent_name)" });
    }

    const newAgent = await Agent.createAgent({ user_id, agent_name, diachi, masothue });
    res.status(201).json(newAgent);
  } catch (err) {
    console.error("❌ Lỗi createAgent:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🟩 Lấy 1 agent theo ID
const getAgent = async (req, res) => {
  try {
    const { agentId } = req.params;
    const agent = await Agent.getAgentById(agentId);

    if (!agent) {
      return res.status(404).json({ error: "Không tìm thấy đại lý" });
    }

    res.json(agent);
  } catch (err) {
    console.error("❌ Lỗi getAgent:", err);
    res.status(500).json({ error: err.message });
  }
};

const getCTVListByAgent = async (req, res) => {
  try {
    const agentId = req.params.agentId; // lấy từ URL
    const ctvList = await getCTVByAgent(agentId);

    res.status(200).json({
      message: "Lấy danh sách CTV thành công",
      ctvList
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 🟩 Cập nhật agent
const updateAgent = async (req, res) => {
  try {
    const { agentId } = req.params;
    const fields = req.body;

    if (!fields || Object.keys(fields).length === 0) {
      return res.status(400).json({ error: "⚠️ Không có dữ liệu để cập nhật" });
    }

    const updatedAgent = await Agent.updateAgent(agentId, fields);
    if (!updatedAgent) {
      return res.status(404).json({ error: "Không tìm thấy đại lý để cập nhật" });
    }

    res.json(updatedAgent);
  } catch (err) {
    console.error("❌ Lỗi updateAgent:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🟩 Xoá agent
const deleteAgent = async (req, res) => {
  try {
    const { agentId } = req.params;
    await Agent.deleteAgent(agentId);
    res.json({ success: true, message: "Đã xoá đại lý thành công" });
  } catch (err) {
    console.error("❌ Lỗi deleteAgent:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🟩 Lấy danh sách agent (phân trang + tìm kiếm)
const listAgents = async (req, res) => {
  try {
    const { search = "", limit = 50, page = 1 } = req.query;
    const data = await Agent.listAgents({
      search,
      limit: parseInt(limit) || 50,
      page: parseInt(page) || 1,
    });
    res.json(data);
  } catch (err) {
    console.error("❌ Lỗi listAgents:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🟩 Lấy toàn bộ agent (dành cho dropdown hoặc xuất Excel)
const getAllAgents = async (req, res) => {
  try {
    const data = await Agent.getAllAgents();
    res.json(data);
  } catch (err) {
    console.error("❌ Lỗi getAllAgents:", err);
    res.status(500).json({ error: err.message });
  }
};


// Cập nhật nhiều đại lý cùng lúc
const updateManyAgents = async (req, res) => {
  try {
    const { agents } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!Array.isArray(agents) || agents.length === 0) {
      return res.status(400).json({ error: "⚠️ Danh sách đại lý không hợp lệ hoặc trống" });
    }

    // Gọi model để xử lý
    const updatedAgents = await Agent.updateManyAgents(agents);

    res.json({
      success: true,
      message: `✅ Đã cập nhật thành công ${updatedAgents.length} đại lý`,
      data: updatedAgents,
    });
  } catch (err) {
    console.error("❌ Lỗi updateManyAgents:", err);
    res.status(500).json({ error: err.message });
  }
};

async function getOrdersByAgent(req, res) {
  try {
    const agentId = Number(req.params.id);
    if (!agentId) {
      return res.status(400).json({ message: 'agent_id không hợp lệ.' });
    }

    const opts = {
      search: req.query.search || '',
      status: req.query.status || null,
    };

    const orders = await Agent.getOrdersByAgent(agentId, opts);

    return res.status(200).json({ data: orders });
  } catch (err) {
    console.error('getOrdersByAgent error:', err);
    return res.status(500).json({
      message: 'Lỗi server khi lấy đơn hàng đại lý.',
      error: err.message
    });
  }
}

/** Lấy đơn hàng của tất cả CTV do đại lý quản lý */
async function getOrdersOfCTVByAgent(req, res) {
  try {
    const agentId = Number(req.params.id);
    if (!agentId) {
      return res.status(400).json({ message: 'agent_id không hợp lệ.' });
    }

    const opts = {
      search: req.query.search || '',
      status: req.query.status || null
    };

    const orders = await Agent.getOrdersOfCTVByAgent(agentId, opts);

    return res.status(200).json({ data: orders });

  } catch (err) {
    console.error('getOrdersOfCTVByAgent error:', err);
    return res.status(500).json({
      message: 'Lỗi server khi lấy đơn hàng CTV của đại lý.',
      error: err.message
    });
  }
}


module.exports = {
  createAgent,
  getAgent,
  getCTVListByAgent,
  updateAgent,
  deleteAgent,
  listAgents,
  getAllAgents,
  updateManyAgents,
  getOrdersByAgent,
  getOrdersOfCTVByAgent
};
