const Agent = require('../models/agent_model');

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

module.exports = {
  createAgent,
  getAgent,
  updateAgent,
  deleteAgent,
  listAgents,
  getAllAgents,
};
