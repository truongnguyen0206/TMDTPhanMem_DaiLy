const express = require('express');
const multer = require('multer');
const router = express.Router();

const dashboardController = require('../../controllers/dashboard_controller');
const { authenticateToken } = require('../../middlewares/auth_middleware');
const { validateExcelUpload } = require('../../middlewares/validator_middleware');

// Cấu hình Multer để xử lý file upload
const upload = multer({ dest: 'uploads/' }); // Tạo thư mục 'uploads' ở gốc dự án

// --- Định nghĩa các tuyến đường API cho Dashboard ---

// Tất cả các route trong file này đều yêu cầu xác thực
router.use(authenticateToken);

// GET: Lấy toàn bộ dữ liệu dashboard cá nhân
router.get('/personal', dashboardController.getPersonalDashboard);

// GET: Lấy thống kê tổng quan (doanh số, hoa hồng...)
router.get('/statistics', dashboardController.getStatistics);

// GET: Lấy tóm tắt về sản phẩm (top sản phẩm bán chạy)
router.get('/products-summary', dashboardController.getProductsSummary);

// POST: Gửi yêu cầu rút tiền
router.post('/request-withdrawal', dashboardController.requestWithdrawal);

// POST: Tải lên và xử lý file Excel
// Luồng middleware: Xác thực -> Tải file lên -> Validate file -> Xử lý
router.post(
    '/upload-excel',
    upload.single('excelFile'), // 'excelFile' là tên field trong form-data
    validateExcelUpload,
    dashboardController.uploadExcel
);

module.exports = router;