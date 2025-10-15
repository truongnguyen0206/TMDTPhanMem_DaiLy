import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NppLayout from '../components/layout/NppLayout';
import CtvLayout from '../components/layout/CtvLayout';

const RoleBasedLayout = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Dựa vào role của user để chọn Layout phù hợp
  // Giả sử role 'Nhà phân phối' là cho NPP và 'Cộng tác viên' là cho CTV
  if (user.role === 'Nhà phân phối') {
    return <NppLayout />;
  }

  if (user.role === 'Cộng tác viên') {
    return <CtvLayout />;
  }

  // Có thể thêm một trang fallback nếu role không xác định
  return <div>Vai trò không hợp lệ</div>;
};

export default RoleBasedLayout; 