const dashboardService = require('../services/dashboard.service');

const getPersonalDashboard = async (req, res) => {
    try {
        const userId = req.user.id; // Giả sử authMiddleware set req.user từ token
        const data = await dashboardService.getPersonalData(userId);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const uploadExcel = async (req, res) => {
    try {
        const userId = req.user.id;
        await dashboardService.processExcelUpload(req.file.path, userId);
        res.json({ message: 'Data uploaded and processed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getPersonalDashboard,
    uploadExcel
};