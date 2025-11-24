// const jwt = require("jsonwebtoken");
// // const pool = require("../config/database_config");
// const supabase = require("../config/supabaseClient");

// const verifyToken = (req, res, next) => {
//   const authHeader = req.headers["authorization"];
//   if (!authHeader) return res.status(401).json({ message: "Chưa có token" });

//   const token = authHeader.split(" ")[1];
//   if (!token) return res.status(401).json({ message: "Token không hợp lệ" });

//   jwt.verify(token, process.env.JWT_SECRET || "mysecret", (err, user) => {
//     if (err) return res.status(403).json({ message: "Token không hợp lệ" });
//     req.user = user;
//     next();
//   });
// };

// const isAdmin = async (req, res, next) => {
//   try {
//     const result = await pool.query(
//       `SELECT r.role_name 
//        FROM users_view u 
//        JOIN web_auth.roles r ON u.role_id = r.role_id 
//        WHERE u.user_id = $1`,
//       [req.user.id]
//     );

//     if (result.rows.length === 0 || result.rows[0].role_name !== "Admin") {
//       return res.status(403).json({ message: "Chỉ Admin mới có quyền" });
//     }
//     next();
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // Middleware xác thực token
// const authenticateToken = async (req, res, next) => {
//   const token = req.header('Authorization')?.split(' ')[1];
//   if (!token) return res.status(401).json({ message: 'No token provided' });

//   try {
//     const { data: { user }, error } = await supabase.auth.getUser(token);
//     if (error || !user) return res.status(401).json({ message: 'Invalid token' });

//     req.user = user;
//     next();
//   } catch (err) {
//     return res.status(500).json({ message: 'Token verification failed', error: err.message });
//   }
// };

// // Middleware kiểm tra quyền truy cập (vai trò người dùng)
// const requireRole = (roles = []) => {
//   return (req, res, next) => {
//     const userRole = req.user?.user_metadata?.role; // tuỳ theo cấu trúc metadata của bạn
//     if (!roles.includes(userRole)) {
//       return res.status(403).json({ message: 'Access denied: insufficient permissions' });
//     }
//     next();
//   };
// };

// const authMiddleware = async (req, res, next) => {
//   try {
//     const token = req.headers.authorization?.split(" ")[1];
//     if (!token) return res.status(401).json({ message: "Thiếu token Supabase" });

//     const { data, error } = await supabase.auth.getUser(token);
//     if (error || !data?.user) return res.status(403).json({ message: "Token không hợp lệ" });

//     req.user = data.user;
//     next();
//   } catch (err) {
//     res.status(500).json({ message: "Lỗi xác thực người dùng" });
//   }
// };


// module.exports = { 
//   verifyToken, 
//   isAdmin,
//   authenticateToken,
//   requireRole,
//   authMiddleware
//  };


// // const supabase = require("../config/supabaseClient");

// // /**
// //  * Xác thực người dùng qua Supabase token.
// //  */
// // const authenticateUser = async (req, res, next) => {
// //   try {
// //     const token = req.header("Authorization")?.split(" ")[1];
// //     if (!token) return res.status(401).json({ message: "Thiếu token" });

// //     const { data, error } = await supabase.auth.getUser(token);
// //     if (error || !data?.user) {
// //       return res.status(403).json({ message: "Token không hợp lệ" });
// //     }

// //     req.user = data.user;
// //     next();
// //   } catch (err) {
// //     console.error("Auth Error:", err);
// //     res.status(500).json({ message: "Lỗi xác thực", error: err.message });
// //   }
// // };

// // module.exports = { authenticateUser };


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
