import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const useAuth = () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const decoded = jwtDecode(token);
      // Kiểm tra token có hợp lệ và có phải admin không
      if (decoded.exp * 1000 > Date.now() && decoded.role === 'Admin') {
        return { isAuthenticated: true, isAdmin: true };
      }
    } catch (error) {
      console.error("Token không hợp lệ:", error);
      return { isAuthenticated: false, isAdmin: false };
    }
  }
  return { isAuthenticated: false, isAdmin: false };
};

const ProtectedRoute = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated || !isAdmin) {
    // Nếu chưa đăng nhập hoặc không phải admin, chuyển về trang login
    return <Navigate to="/login" />;
  }

  // Nếu đã đăng nhập và là admin, cho phép truy cập
  return <Outlet />;
};

export default ProtectedRoute;