import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Auth pages
import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';

//Layout
import NppLayout from '../components/layout/NppLayout';
import CtvLayout from '../components/layout/CtvLayout';
import AdminLayout from '../components/layout/AdminLayout';

//NPPpages
import DashboardPage from '../pages/NPP/DashboardPage';
import OrdersPage from '../pages/NPP/OrdersPage';
import CommissionPage from '../pages/NPP/CommissionPage';
import PayCommissionPage from '../pages/NPP/PayCommissionPage';
import AgentsPage from '../pages/NPP/AgentsPage';
import AddAgentPage from '../pages/NPP/AddAgentPage';
import UpdateAgentPage from '../pages/NPP/UpdateAgentPage';
import BalancePage from '../pages/NPP/BalancePage';
import TransactionDetailPage from '../pages/NPP/TransactionDetailPage';
import WithdrawalRequestPage from '../pages/NPP/WithdrawalRequestPage';

// CTV Pages
import CtvDashboardPage from '../pages/CTV/DashboardPage';
import ProductPage from '../pages/CTV/ProductPage';
import SalesPage from '../pages/CTV/SalesPage';
import CtvCommissionPage from '../pages/CTV/CommissionPage';

// Admin Pages
import AdminDashboardPage from '../pages/Admin/DashboardPage';
import AccountsPage from '../pages/Admin/AccountsPage';
import AddAccountPage from '../pages/Admin/AddAccountPage';

import ProtectedRoute from './ProtectedRoute';


const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<RegisterPage />} />

        {/* --- CÁC ROUTE CẦN BẢO VỆ --- */}
        <Route element={<ProtectedRoute />}>
        
          {/* --- Cấu hình cho NPP --- */}
          {/* SỬA LẠI CÁC ROUTE BÊN TRONG ĐỂ DÙNG ĐƯỜNG DẪN TƯƠNG ĐỐI */}
          <Route path="/npp" element={<NppLayout />}>
            {/* "index" có nghĩa là đây là trang mặc định của /npp */}
            <Route index element={<DashboardPage />} /> 
            <Route path="orders" element={<OrdersPage />} />
            <Route path="commission" element={<CommissionPage />} />
            <Route path="commission/pay/:id" element={<PayCommissionPage />} />
            <Route path="agents" element={<AgentsPage />} />
            <Route path="agents/new" element={<AddAgentPage />} />
            <Route path="agents/edit/:id" element={<UpdateAgentPage />} />
            <Route path="balance" element={<BalancePage />} />
            <Route path="balance/transaction/:id" element={<TransactionDetailPage />} />
            <Route path="balance/withdraw" element={<WithdrawalRequestPage />} />
          </Route>

          {/* --- Cấu hình cho CTV --- */}
          <Route path="/ctv" element={<CtvLayout />}>
            <Route path="dashboard" element={<CtvDashboardPage />} />
            <Route path="products" element={<ProductPage />} />
            <Route path="sales" element={<SalesPage />} />
            <Route path="commission" element={<CtvCommissionPage />} />
          </Route>

          {/* --- Cấu hình cho ADMIN --- */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="accounts" element={<AccountsPage />} />
             <Route path="accounts/new" element={<AddAccountPage />} />
            {/* Thêm các route khác của Admin ở đây */}
          </Route>

        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;