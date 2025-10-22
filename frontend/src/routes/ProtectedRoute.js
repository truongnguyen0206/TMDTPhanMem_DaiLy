import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

const ProtectedRoute = () => {
  // CẬP NHẬT: Lấy cả user và isInitializing từ AuthContext
  const { user, isInitializing } = useAuth(); 

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
    return <Navigate to="/login" replace />; 
  }

  // Nếu đã kiểm tra xong và có user, cho phép truy cập
  return <Outlet />; 
};

export default ProtectedRoute;
