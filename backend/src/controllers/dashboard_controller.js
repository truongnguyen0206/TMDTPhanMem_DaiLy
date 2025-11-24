const dashboardService = require('../services/dashboard_service');
const { getDistributorKpi } = require('../services/dashboard_service');
const { countOrderByDistributor } = require("../services/dashboard_service");
// const { countOrderByDistributor } = require("../models/dashboard_model");



const getPersonalDashboard = async (req, res) => {
    try {
        const userId = req.user.id; // Lấy userId từ auth middleware
        
        if (!userId) {
             return res.status(401).json({ error: 'Unauthorized: User ID not found' });
        }
        
        const data = await dashboardService.getPersonalData(userId);
        res.json({ success: true, data }); // Thêm response success
    } catch (err) {
        console.error('Error in getPersonalDashboard:', err.message);
        res.status(500).json({ error: 'Failed to retrieve dashboard data', details: err.message });
    }
};

const uploadExcel = async (req, res) => {
    try {
        const userId = req.user.id;
        
        if (!req.file) {
             // Lỗi này thường do Multer hoặc validateExcelUpload bắt
             return res.status(400).json({ error: 'No file uploaded or file failed validation' });
        }
        
        await dashboardService.processExcelUpload(req.file.path, userId);
        res.json({ success: true, message: 'Data uploaded and processed' });
    } catch (err) {
        console.error('Error in uploadExcel:', err.message);
        res.status(500).json({ error: 'Failed to process uploaded file', details: err.message });
    }
};

const getStatistics = async (req, res) => {
    try {
        const userId = req.user.id;
        const stats = await dashboardService.getStatistics(userId);
        res.json({ success: true, stats });
    } catch (err) {
        console.error('Error in getStatistics:', err.message);
        res.status(500).json({ error: 'Failed to retrieve statistics', details: err.message });
    }
};

const getProductsSummary = async (req, res) => {
    try {
        const userId = req.user.id;
        const summary = await dashboardService.getProductsSummary(userId);
        res.json({ success: true, summary });
    } catch (err) {
        console.error('Error in getProductsSummary:', err.message);
        res.status(500).json({ error: 'Failed to retrieve product summary', details: err.message });
    }
};

const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    if (err.type === 'FILE_UPLOAD_ERROR') {
        return res.status(400).json({
            error: 'File upload failed',
            details: err.message
        });
    }

    if (err.type === 'VALIDATION_ERROR') {
        return res.status(400).json({
            error: 'Validation failed',
            details: err.message
        });
    }

    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
};

/**
 * Dashboard dành cho nhà phân phối
 * Lấy tổng số đại lý thuộc tài khoản distributor
 */
const getDistributorDashboard = async (req, res, next) => {
    try {
      const nppId = Number(req.params.npp_id);
  
      if (!nppId) {
        return res.status(400).json({
          success: false,
          message: 'Missing npp_id in params',
        });
      }
  
      const data = await getDistributorKpi(nppId);
  
      return res.status(200).json({
        success: true,
        message: 'Distributor dashboard fetched successfully.',
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  const getDistributorOrderCount = async (req, res, next) => {
    try {
      const nppId = Number(req.params.npp_id);
  
      if (!nppId || isNaN(nppId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid or missing npp_id in params",
        });
      }
  
      const totalOrders = await countOrderByDistributor(nppId);
  
      return res.status(200).json({
        success: true,
        message: "Distributor order count fetched successfully",
        data: {
          npp_id: nppId,
          total_orders: totalOrders,
        },
      });
    } catch (err) {
      console.error("Error in getDistributorOrderCount:", err);
      next(err);
    }
  };

//=======================================
//Controller sẽ gọi Service tương ứng và trả về JSON( An Làm )
// =======================================

const getAdminStats = async (req, res) => {
  try {
      // 🆕 Lấy tham số groupBy từ query URL (mặc định là 'month')
      const { groupBy } = req.query; 
      
      // Truyền tham số vào service
      const stats = await dashboardService.getAdminOrderStats(groupBy);
      
      res.json({ success: true, data: stats });
  } catch (err) {
      console.error('Error in getAdminStats:', err.message);
      res.status(500).json({ error: 'Failed to retrieve admin stats', details: err.message });
  }
};

// Sửa lỗi CRITICAL: Hợp nhất tất cả các hàm controller vào một module.exports
module.exports = {
    getPersonalDashboard,
    uploadExcel,
    getStatistics,
    getProductsSummary,
    errorHandler,
    getDistributorDashboard,
    getDistributorOrderCount,
    
};