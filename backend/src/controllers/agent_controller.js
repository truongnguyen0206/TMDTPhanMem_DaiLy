const Agent = require('../models/agent_model');
const pool = require("../config/database_config");

const createAgent = async (req, res) => {
  try {
    const { user_id, agent_name, diachi, masothue } = req.body;
    if (!agent_name) return res.status(400).json({ error: 'agent_name required' });
    const a = await Agent.createAgent({ user_id, agent_name, diachi, masothue });
    res.json(a);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const getAgent = async (req, res) => {
  try {
    const a = await Agent.getAgentById(req.params.agentId);
    if (!a) return res.status(404).json({ error: 'Agent not found' });
    res.json(a);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateAgent = async (req, res) => {
  try {
    const fields = req.body;
    const a = await Agent.updateAgent(req.params.agentId, fields);
    res.json(a);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteAgent = async (req, res) => {
  try {
    await Agent.deleteAgent(req.params.agentId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const listAgents = async (req, res) => {
  try {
    const { search, limit, offset } = req.query;
    const data = await Agent.listAgents({ search, limit: limit ? parseInt(limit) : undefined, offset: offset ? parseInt(offset) : undefined });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createAgent, getAgent, updateAgent, deleteAgent, listAgents };
