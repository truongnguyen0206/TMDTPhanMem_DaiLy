const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads' }); // Thư mục tạm để lưu file upload, tạo thư mục 'uploads' nếu chưa có

const router = express.Router();
const dashboardController = require('../../controllers/dashboard_controller');
const { authenticateToken } = require('../../middlewares/auth_middleware');

const { validateExcelUpload } = require('../../middlewares/validator_middleware');


// GET: Lấy toàn bộ dữ liệu dashboard cá nhân
router.get('/personal', authenticateToken, dashboardController.getPersonalDashboard);

// POST: Tải lên và xử lý file Excel
// Thứ tự Middleware phải là: 
// 1. Xác thực (authMiddleware) 
// 2. Lưu file tạm (upload.single) 
// 3. KIỂM TRA ĐỊNH DẠNG FILE (validateExcelUpload)
// 4. Xử lý Logic (dashboardController.uploadExcel)
router.post(
    '/upload-excel',
    authenticateToken,
    upload.single('file'),
    validateExcelUpload,  // <-- BỔ SUNG VÀO VỊ TRÍ NÀY
    dashboardController.uploadExcel
);

// GET: Lấy thống kê tổng quan
router.get('/statistics', authenticateToken, dashboardController.getStatistics);

// GET: Lấy tóm tắt về sản phẩm
router.get('/products-summary', authenticateToken, dashboardController.getProductsSummary);

router.get('/tongdlcuanpp/:npp_id', dashboardController.getDistributorDashboard);
router.get("/distributor/orders-count/:npp_id", dashboardController.getDistributorOrderCount);


module.exports = router;