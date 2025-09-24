const express = require('express');
const cors = require('cors');
const db = require('./config/db');  // import file db.js
const authRoutes = require('./api/routes/auth_route');

require('dotenv').config(); // Để đọc file .env

// Khởi tạo app express
const app = express();

// Sử dụng middleware
app.use(cors()); // Rất quan trọng! Dùng để cho phép frontend truy cập
app.use(express.json()); // Cho phép server đọc dữ liệu JSON được gửi lên
app.use("/auth", authRoutes);


// Định nghĩa cổng cho server, ưu tiên cổng trong file .env hoặc mặc định là 5001
const PORT = process.env.PORT || 5001;

// === TẠO API ENDPOINT ĐỂ KIỂM TRA ===
// Đây là "cánh cửa" mà frontend sẽ gọi đến
app.get('/api/test', (req, res) => {
  // Khi có yêu cầu đến '/api/test', server sẽ trả về một JSON
  res.json({ message: 'Kết nối thành công từ backend! 🎉' });
});

app.get('/', (req, res) => {
  res.send("Server chạy ngon lành 🚀");
});

// API Đăng ký
app.post("/auth/register", async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Thiếu thông tin!" });
    }

    const checkUser = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR username = $2",
      [email, username]
    );

    if (checkUser.rows.length > 0) {
      return res.status(400).json({ message: "Username hoặc Email đã tồn tại!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Giả sử role_id = 2 là user thường
    await pool.query(
      "INSERT INTO users (username, email, password, phone, role_id) VALUES ($1, $2, $3, $4, $5)",
      [username, email, hashedPassword, phone || null, 2]
    );

    res.json({ message: "Đăng ký thành công 🎉" });
  } catch (err) {
    console.error("🔥 Lỗi backend:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
});



// Khởi động server
app.listen(PORT, () => {
  console.log(`Backend server đang chạy tại http://localhost:${PORT}`);
});