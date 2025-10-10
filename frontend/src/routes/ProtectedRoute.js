// Logic giả định cho ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth

const ProtectedRoute = () => {
  // Lấy cả user và loading từ AuthContext
  const { user } = useAuth(); 
  // 2. Nếu đã kiểm tra xong (loading=false) nhưng không có user, chuyển hướng về /login
  if (!user) {
    // Dùng replace để tránh lưu trang login vào lịch sử duyệt web
    return <Navigate to="/login" replace />; 
  }

  // 3. Nếu đã kiểm tra xong (loading=false) và có user, cho phép truy cập
  return <Outlet />; 
};

export default ProtectedRoute;