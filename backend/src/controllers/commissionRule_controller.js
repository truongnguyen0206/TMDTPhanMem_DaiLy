// File: api/controllers/commissionRule_controller.js

const commissionRuleService = require('../services/commissionRule_service');

const getAllCommissionRules = async (req, res) => {
    try {
        const { data, error } = await commissionRuleService.getAllRules();
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getCommissionRuleById = async (req, res) => {
    try {
        const { data, error } = await commissionRuleService.getRuleById(req.params.id);
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createCommissionRule = async (req, res) => {
    try {
        // req.body chứa tất cả các trường cần thiết
        const { error } = await commissionRuleService.createRule(req.body);
        if (error) throw error;
        res.status(201).json({ message: "Thêm dữ liệu thành công" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateCommissionRule = async (req, res) => {
    try {
        const { data, error } = await commissionRuleService.updateRule(req.params.id, req.body);
        if (error) throw error;
        res.json({ message: "Cập nhật dữ liệu thành công", data: data[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteCommissionRule = async (req, res) => {
    try {
        const { error } = await commissionRuleService.deleteRule(req.params.id);
        if (error) throw error;
        res.json({ message: "Commission rule deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllCommissionRules,
    getCommissionRuleById,
    createCommissionRule,
    updateCommissionRule,
    deleteCommissionRule,
};