// src/routes/AppRouter.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout/MainLayout';
import DashboardPage from '../pages/Dashboard/DashboardPage';
import LoginPage from '../pages/Auth/LoginPage';

// Component placeholder cho các trang chưa có nội dung
const Placeholder = ({ title }) => <div style={{ padding: 40 }}><h2>{title}</h2></div>;

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<MainLayout />}>
          {/* Dashboard */}
          <Route index element={<DashboardPage />} />
          
          {/* Quản Lý Tài Khoản */}
          <Route path="accounts/agents" element={<Placeholder title="Danh sách Đại Lý" />} />
          <Route path="accounts/staff" element={<Placeholder title="Danh sách Nhân Viên" />} />
          <Route path="accounts/collaborators" element={<Placeholder title="Danh sách Cộng Tác Viên" />} />

          {/* Hoa Hồng */}
          <Route path="commission/agents" element={<Placeholder title="Hoa Hồng - Đại Lý" />} />
          <Route path="commission/staff" element={<Placeholder title="Hoa Hồng - Nhân Viên" />} />
          <Route path="commission/collaborators" element={<Placeholder title="Hoa Hồng - CTV" />} />

          {/* Các trang khác */}
          <Route path="reports" element={<Placeholder title="Báo Cáo" />} />
          <Route path="settings" element={<Placeholder title="Settings and profile" />} />
          <Route path="tickets" element={<Placeholder title="Ticket" />} />
        </Route>
        
        {/* Thêm các route cho Login, Register ở đây nếu cần */}
        {/* <Route path="/login" element={<LoginPage />} /> */}
      </Routes>
    </Router>
  );
};

export default AppRouter;