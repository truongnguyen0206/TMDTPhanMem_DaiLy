const { OAuth2Client } = require("google-auth-library");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user_model");
const { findByEmailOrUsername, createUser, findByUsername } = require("../models/user_model");
// const pool = require("../config/database_config");
const supabase = require("../config/supabaseClient");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Kiểm tra API
const healthCheck = (req, res) => {
  res.json({ message: "Auth API is working!" });
};

/**
 * Kiểm tra độ mạnh mật khẩu.
 * Trả về { valid: boolean, reasons: string[] }.
 */
const checkPasswordStrength = (password) => {
  const reasons = [];
  if (!password || password.length < 8) {
    reasons.push("Mật khẩu cần ít nhất 8 ký tự.");
  }
  if (!/[A-Z]/.test(password)) {
    reasons.push("Mật khẩu cần ít nhất 1 chữ hoa.");
  }
  if (!/[a-z]/.test(password)) {
    reasons.push("Mật khẩu cần ít nhất 1 chữ thường.");
  }
  if (!/[0-9]/.test(password)) {
    reasons.push("Mật khẩu cần ít nhất 1 chữ số.");
  }
  if (!/[!@#\$%\^\&*\)\(+=._-]/.test(password)) {
    reasons.push("Mật khẩu nên có ít nhất 1 ký tự đặc biệt (ví dụ: !@#$%).");
  }
  return { valid: reasons.length === 0, reasons };
};


// ======================
// Đăng ký người dùng
// ======================
const register = async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;

    // --- Kiểm tra dữ liệu đầu vào
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Thiếu thông tin!" });
    }

    // --- Kiểm tra email trùng
    const existUser = await findByEmailOrUsername(email, username);
    if (existUser.length > 0) {
      const existingEmail = existUser.find((u) => u.email === email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email đã tồn tại!" });
      }
      return res.status(400).json({ message: "Username đã tồn tại!" });
    }

    // --- Kiểm tra độ mạnh mật khẩu
    const passwordCheck = checkPasswordStrength(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({
        message: "Mật khẩu yếu!",
        reasons: passwordCheck.reasons,
      });
    }

    // --- Hash mật khẩu và lưu vào DB
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await createUser({
      username,
      email,
      password: hashedPassword,
      phone: phone || null,
      role_id: 4,
    });

    res.status(201).json({ message: "Đăng ký thành công 🎉", user: newUser });
  } catch (err) {
    console.error("🔥 Lỗi backend register:", err);
    res.status(500).json({ message: "Lỗi server!", error: err.message });
  }
};

/**
 * Đăng nhập người dùng nội bộ (Local login)
 * - Không tạo token trùng lặp nếu đã được Supabase xác thực
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // ===== Kiểm tra đầu vào =====
    if (!username || !password) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.",
      });
    }

    // ===== Tìm user theo email hoặc username =====
    const users = await findByEmailOrUsername(username, username);
    const user = users && users.length ? users[0] : null;

    if (!user) {
      return res.status(404).json({
        message: "Tài khoản không có trong hệ thống.",
        suggestion: "Vui lòng đăng ký tài khoản mới.",
      });
    }

    // ===== Kiểm tra mật khẩu =====
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        message: "Tên đăng nhập hoặc mật khẩu không đúng.",
      });
    }

    // ===== Lấy role =====
    let roleName = null;
    try {
      const { data: roleData, error } = await supabase
        .from("users_roles") // bảng hoặc view bạn dùng
        .select("role_name")
        .eq("role_id", user.role_id)
        .single(); // lấy 1 dòng duy nhất
    
      if (error) throw error;
    
      roleName = roleData?.role_name || null;
    } catch (err) {
      console.warn("⚠️ Không thể truy vấn role:", err);
    }

    // ===== Sinh JWT dùng chung với middleware verifyToken =====
    const payload = {
      id: user.user_id || user.id,
      username: user.username,
      email: user.email,
      role_id: user.role_id,
      role: roleName,
    };

    // Token format thống nhất với verifyToken
    const token = jwt.sign(payload, process.env.JWT_SECRET || "mysecret", {
      expiresIn: "1d",
    });

    return res.status(200).json({
      message: "Đăng nhập thành công!",
      token, // sẽ dùng verifyToken để xác thực các request sau
      user: payload,
    });
  } catch (error) {
    console.error("🔥 Lỗi đăng nhập:", error);

    if (
      error.code === "ECONNREFUSED" ||
      error.message.includes("connect") ||
      error.message.includes("timeout")
    ) {
      return res.status(503).json({
        message: "Không thể kết nối đến máy chủ, vui lòng thử lại sau.",
      });
    }

    return res.status(500).json({
      message: "Lỗi hệ thống, vui lòng thử lại sau.",
      error: error.message,
    });
  }
};

/**
 * Đăng ký tài khoản bằng Google (Google OAuth Sign-up)
 */
const registerWithGoogle = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token)
      return res.status(400).json({ message: "Thiếu mã xác thực Google!" });

    // 🔍 Xác minh token với Google
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // 🔍 Kiểm tra email tồn tại chưa
    const existing = await findByEmailOrUsername(email, email);
    if (existing.length > 0) {
      return res.status(400).json({
        message: "Email này đã tồn tại trong hệ thống!",
        suggestion: "Vui lòng dùng đăng nhập bằng Google.",
      });
    }

    // 🟦 Tạo username không trùng
    let baseUsername = name.replace(/\s+/g, "").toLowerCase();
    let finalUsername = baseUsername;
    let counter = 1;

    while (await findByUsername(finalUsername)) {
      finalUsername = `${baseUsername}${counter}`;
      counter++;
    }

    // 🟢 Tạo tài khoản mới
    const newUser = await createUser({
      username: finalUsername,
      email,
      password: null,
      role_id: 4,
    });

    res.status(201).json({
      message: "Đăng ký Google thành công!",
      user: newUser,
    });
  } catch (err) {
    console.error("🔥 Lỗi đăng ký Google:", err);
    res.status(500).json({
      message: "Không thể đăng ký bằng Google!",
      error: err.message,
    });
  }
};

/**
 * Đăng nhập bằng Google
 */
const loginWithGoogle = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token)
      return res.status(400).json({ message: "Thiếu mã xác thực Google!" });

    // Xác minh token Google
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    // Kiểm tra xem email có trong DB chưa
    const existing = await findByEmailOrUsername(email, email);
    let user;
    if (existing.length > 0) {
      user = existing[0];
    } else {
      // Tạo tài khoản tự động
      user = await createUser({
        username: name,
        email,
        password: null,
        phone: null,
        role_id: 3,
      });
    }

    res.status(200).json({
      message: "Đăng nhập Google thành công!",
      user,
    });
  } catch (err) {
    console.error("🔥 Lỗi đăng nhập Google:", err);
    res.status(500).json({
      message: "Không thể xác thực tài khoản Google!",
      error: err.message,
    });
  }
};

const updateUser = async (id, { username, email, phone, role_id, status }) => {
  const result = await pool.query(
    `UPDATE users_view 
     SET username = $1, email = $2, phone = $3, role_id = $4, status = $5
     WHERE user_id = $6 
     RETURNING user_id, username, email, phone, role_id, status, created_at`,
    [username, email, phone, role_id, status, id]
  );
  return result.rows[0];
};

const deleteUser = async (id) => {
  const result = await pool.query(
    "DELETE FROM users_view WHERE user_id = $1 RETURNING user_id, username, email",
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
  checkPasswordStrength,
  registerWithGoogle,
  loginWithGoogle,
};
