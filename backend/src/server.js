// backend/src/server.js

// Import các thư viện cần thiết
const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Để đọc file .env

// Khởi tạo app express
const app = express();

// Sử dụng middleware
app.use(cors()); // Rất quan trọng! Dùng để cho phép frontend truy cập
app.use(express.json()); // Cho phép server đọc dữ liệu JSON được gửi lên

// Định nghĩa cổng cho server, ưu tiên cổng trong file .env hoặc mặc định là 5001
const PORT = process.env.PORT || 5001;

// === TẠO API ENDPOINT ĐỂ KIỂM TRA ===
// Đây là "cánh cửa" mà frontend sẽ gọi đến
app.get('/api/test', (req, res) => {
  // Khi có yêu cầu đến '/api/test', server sẽ trả về một JSON
  res.json({ message: 'Kết nối thành công từ backend! 🎉' });
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`Backend server đang chạy tại http://localhost:${PORT}`);
});