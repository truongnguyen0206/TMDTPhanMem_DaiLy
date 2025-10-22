const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user_model");
const { findByEmailOrUsername, createUser, findByUsername } = require("../models/user_model");
const pool = require("../config/database_config");


// Kiểm tra API
const healthCheck = (req, res) => {
  res.json({ message: "Auth API is working!" });
};

// Đăng ký
const register = async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Thiếu thông tin!" });
    }

    const existUser = await findByEmailOrUsername(email, username);
    if (existUser.length > 0) {
      return res.status(400).json({ message: "Username hoặc Email đã tồn tại!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await createUser({
      username,
      email,
      password: hashedPassword,
      phone: phone || null,
      role_id: 2,
    });

    res.status(201).json({ message: "Đăng ký thành công 🎉", user: newUser });
  } catch (err) {
    console.error("🔥 Lỗi backend register:", err);
    res.status(500).json({ message: "Lỗi server!", error: err.message });
  }
};

// Đăng nhập
const login = async (req, res) => {
  try {
    const { username, password } = req.body; // "username" ở đây có thể là username hoặc email

    // Tìm user theo username hoặc email
    const users = await findByEmailOrUsername(username, username);
    const user = users && users.length ? users[0] : null;

    if (!user)
      return res.status(400).json({ message: "Sai username/email hoặc password" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(400).json({ message: "Sai username/email hoặc password" });

    // Lấy role_name nếu cần
    let roleName = null;
    if (user.role_id) {
      const roleRes = await pool.query(
        "SELECT role_name FROM auth.roles WHERE role_id = $1",
        [user.role_id]
      );
      roleName = roleRes.rows[0]?.role_name || null;
    }

    // Payload JWT
    const payload = {
      id: user.user_id || user.id,
      username: user.username,
      email: user.email,
      role: roleName,
      role_id: user.role_id,
    };

    // (Tùy chọn) sinh token
    const token = jwt.sign(payload, process.env.JWT_SECRET || "mysecret", { expiresIn: "1d" });

    res.json({ message: "Đăng nhập thành công", token, user: payload });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

const updateUser = async (id, { username, email, phone, role_id, status }) => {
  const result = await pool.query(
    `UPDATE auth.users 
     SET username = $1, email = $2, phone = $3, role_id = $4, status = $5
     WHERE user_id = $6 
     RETURNING user_id, username, email, phone, role_id, status, created_at`,
    [username, email, phone, role_id, status, id]
  );
  return result.rows[0];
};

const deleteUser = async (id) => {
  const result = await pool.query(
    "DELETE FROM auth.users WHERE user_id = $1 RETURNING user_id, username, email",
    [id]
  );
  return result.rows[0];
};

module.exports = {
  healthCheck,
  register,
  login,
  updateUser,
  deleteUser,
};
