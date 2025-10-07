const supabase = require('../config/db.config');

// Middleware xác thực token
exports.authenticateToken = async (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ message: 'Invalid token' });

  req.user = user;
  next();
};

// Middleware kiểm tra quyền
exports.requireRole = (roles) => {
  return (req, res, next) => {
    const userRole = req.user?.user_metadata?.role;
    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};
