const supabase = require('../config/db.config');

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
  authenticateToken,
  requireRole,
};
