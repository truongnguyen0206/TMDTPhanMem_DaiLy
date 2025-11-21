// src/middlewares/auth_middleware.js
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  // 1. Lấy header Authorization
  const authHeader = req.headers["authorization"];
  
  // 2. Kiểm tra xem có header không
  if (!authHeader) {
      console.log("❌ [Auth] Missing Authorization Header");
      return res.status(401).json({ message: "Chưa có token xác thực" });
  }

  // 3. Tách lấy token (Format: "Bearer <token>")
  const token = authHeader.split(" ")[1];
  if (!token) {
      console.log("❌ [Auth] Token format invalid");
      return res.status(401).json({ message: "Token không hợp lệ" });
  }

  // 4. Xác thực token bằng JWT Secret (Phải khớp với secret lúc tạo token)
  // Lưu ý: process.env.JWT_SECRET phải giống hệt bên auth_controller
  jwt.verify(token, process.env.JWT_SECRET || "mysecret", (err, user) => {
    if (err) {
      console.error("❌ [Auth] Token verification failed:", err.message);
      return res.status(403).json({ message: "Token hết hạn hoặc không hợp lệ" });
    }

    // 5. Lưu thông tin user vào req để các controller sau dùng
    req.user = user;
    
    // console.log("✅ [Auth] User authenticated:", user.username);
    next();
  });
};

// Hàm kiểm tra quyền (Authorization)
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Chưa xác thực người dùng" });
    }

    // Kiểm tra logic role của bạn. 
    // Lưu ý: Payload lúc login bạn lưu role name hay role id?
    // Trong auth_controller cũ: payload chứa { role: roleName, role_id: ... }
    
    const userRole = req.user.role; // Lấy tên role từ token payload
    
    // Chuyển đổi mảng role cho phép thành chữ thường để so sánh cho chắc
    const allowed = allowedRoles.map(r => r.toLowerCase());
    
    // Admin luôn được phép
    if (userRole && userRole.toLowerCase() === 'admin') {
        return next();
    }

    if (!allowed.includes(userRole?.toLowerCase())) {
      console.log(`⛔ [Auth] Access denied. User role: ${userRole}, Required: ${allowedRoles}`);
      return res.status(403).json({ message: "Không đủ quyền truy cập" });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles
};