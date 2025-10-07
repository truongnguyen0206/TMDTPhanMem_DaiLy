const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Thư mục tạm để lưu file upload

const router = express.Router();
const dashboardController = require('../../controllers/dashboard_controller');
const authMiddleware = require('../../middlewares/auth_middleware'); // Giả sử auth.middleware.js là authMiddleware

// Lấy dashboard cá nhân
router.get('/personal', authMiddleware, dashboardController.getPersonalDashboard);

// Upload Excel để cập nhật dữ liệu (nếu cần từ sơ đồ)
router.post('/upload-excel', authMiddleware, upload.single('file'), dashboardController.uploadExcel);

module.exports = router;