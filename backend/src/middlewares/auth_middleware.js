const jwt = require("jsonwebtoken");
const pool = require("../config/database_config");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "Chưa có token" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token không hợp lệ" });

  jwt.verify(token, process.env.JWT_SECRET || "mysecret", (err, user) => {
    if (err) return res.status(403).json({ message: "Token không hợp lệ" });
    req.user = user;
    next();
  });
};

const isAdmin = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT r.role_name 
       FROM auth.users u 
       JOIN auth.roles r ON u.role_id = r.role_id 
       WHERE u.user_id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0 || result.rows[0].role_name !== "Admin") {
      return res.status(403).json({ message: "Chỉ Admin mới có quyền" });
    }
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Middleware xác thực token
const authenticateToken = async (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ message: 'Invalid token' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ message: 'Token verification failed', error: err.message });
  }
};

// Middleware kiểm tra quyền truy cập (vai trò người dùng)
const requireRole = (roles = []) => {
  return (req, res, next) => {
    const userRole = req.user?.user_metadata?.role; // tuỳ theo cấu trúc metadata của bạn
    if (!roles.includes(userRole)) {
      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }
    next();
  };
};


module.exports = { 
  verifyToken, 
  isAdmin,
  authenticateToken,
  requireRole,
 };
