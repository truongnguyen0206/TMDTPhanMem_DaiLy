import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

const ProtectedRoute = ({ allowedRoles }) => {
  // CẬP NHẬT: Lấy cả user và isInitializing từ AuthContext
  const { user, isInitializing } = useAuth(); 
  const location = useLocation();

  // THÊM MỚI: Nếu đang trong quá trình kiểm tra token, hiển thị màn hình chờ
  if (isInitializing) {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-xl font-semibold">Đang tải, vui lòng chờ...</div>
        </div>
    );
  }

  // Nếu đã kiểm tra xong và không có user, chuyển hướng về /login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />; 
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Chuyển hướng dựa trên role thực tế của user để về đúng trang chủ của họ
    if (user.role === 'Admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'Nhà phân phối') return <Navigate to="/npp/dashboard" replace />;
    if (user.role === 'Đại lý' || user.role === 'Agent') return <Navigate to="/dl/dashboard" replace />; // Fix lỗi của bạn tại đây
    if (user.role === 'Cộng tác viên' || user.role === 'CTV') return <Navigate to="/ctv/dashboard" replace />;
    
    // Fallback nếu role không xác định
    return <Navigate to="/login" replace />;}

  // Nếu đã kiểm tra xong và có user, cho phép truy cập
  return <Outlet />; 
};

export default ProtectedRoute;
