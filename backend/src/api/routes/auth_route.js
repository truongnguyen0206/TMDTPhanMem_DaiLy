const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../../config/db");
const router = express.Router();


router.get("/", (req, res) => {
  res.json({ message: "Auth API is working!" });
});
// Đăng ký
router.post("/register", async (req, res) => {
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

    await pool.query(
      "INSERT INTO users (username, email, password, phone, role_id) VALUES ($1, $2, $3, $4, $5)",
      [username, email, hashedPassword, phone || null, 1]
    );

    res.status(201).json({ message: "Đăng ký thành công 🎉" });
  } catch (err) {
    console.error("🔥  Lỗi backend:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
});

// Đăng nhập
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Sai username hoặc password" });
    }

    const user = result.rows[0];
    console.log("User DB:", user); // DEBUG

    // So sánh mật khẩu đã hash
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Sai username hoặc password" });
    }

    // Tạo JWT
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1h" }
    );

    res.json({ message: "Đăng nhập thành công", token });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Lỗi server" });
  }
});


module.exports = router;
