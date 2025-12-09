// 'use strict';

// /**
//  * Kiểm tra quyền truy cập route theo role.
//  * @param {...string} allowedRoles - Danh sách vai trò được phép.
//  * @returns {Function} Middleware function.
//  */
// function authorizeRoles(...allowedRoles) {
//   return (req, res, next) => {
//     const user = req.user;

//     if (!user) {
//       return res.status(401).json({ success: false, error: 'Unauthorized: no user in request' });
//     }

//     // Admin luôn có toàn quyền
//     if (user.role === 'admin') {
//       return next();
//     }

//     // Kiểm tra role có trong danh sách cho phép không
//     if (!allowedRoles.includes(user.role)) {
//       return res.status(403).json({
//         success: false,
//         error: 'Forbidden: insufficient role privileges',
//       });
//     }

//     next();
//   };
// }

// module.exports = { authorizeRoles };


/**
 * Kiểm tra quyền truy cập route theo role trong Supabase metadata.
 * @param {...string} allowedRoles - Danh sách role được phép truy cập.
 */
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    const role = req.user?.user_metadata?.role;

    if (!role) {
      return res.status(401).json({ message: "Chưa xác định vai trò người dùng" });
    }

    // Admin luôn được phép
    if (role === "admin") return next();

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ message: "Không đủ quyền truy cập" });
    }

    next();
  };
}

module.exports = { authorizeRoles };
