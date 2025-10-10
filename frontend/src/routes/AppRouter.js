// src/routes/AppRouter.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout/MainLayout';
import DashboardPage from '../pages/Dashboard/DashboardPage';
import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';
import AccountListPage from '../pages/Accounts/AccountListPage';
import AccountFormPage from '../pages/Accounts/AccountFormPage';
import OrderManagementPage from '../pages/Orders/OrderManagementPage';
import CommissionListPage from '../pages/Commission/CommissionListPage';
import CommissionDetailPage from '../pages/Commission/CommissionDetailPage';

import ProtectedRoute from './ProtectedRoute';

// Component placeholder cho các trang chưa có nội dung
const Placeholder = ({ title }) => <div style={{ padding: 40 }}><h2>{title}</h2></div>;

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<MainLayout />}>
          {/* Dashboard */}
          <Route index element={<DashboardPage />} />
          
          {/* Quản Lý Tài Khoản */}
          <Route path="accounts" element={<AccountListPage />} />
          <Route path="accounts/new" element={<AccountFormPage />} />
          <Route path="accounts/edit/:id" element={<AccountFormPage />} />

          {/* Hoa Hồng */}
          <Route path="commissions" element={<CommissionListPage />} />
          <Route path="commissions/edit/:id" element={<CommissionDetailPage />} />
          
          {/* Quản lý đơn hàng phát sinh */}
          <Route path="orders" element={<OrderManagementPage />} />

          {/* Các trang khác */}
          <Route path="reports" element={<Placeholder title="Báo Cáo" />} />
          <Route path="settings" element={<Placeholder title="Settings and profile" />} />
          <Route path="tickets" element={<Placeholder title="Ticket" />} />
          </Route>
        </Route>
        
        {/* Thêm các route cho Login, Register ở đây nếu cần */}
        {/* <Route path="/login" element={<LoginPage />} /> */}
      </Routes>
    </Router>
  );
};

export default AppRouter;