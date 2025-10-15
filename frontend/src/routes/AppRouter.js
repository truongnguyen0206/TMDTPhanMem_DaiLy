import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate  } from 'react-router-dom';

// Auth pages
import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';

//Layout
import Layout from '../components/layout/Layout';
//NPPpages
import NPPDashboardPage from '../pages/NPP/DashboardPage';
import NPPOrdersPage from '../pages/NPP/OrdersPage';
import NPPCommissionPage from '../pages/NPP/CommissionPage';
import NPPPayCommissionPage from '../pages/NPP/PayCommissionPage';
import NPPAgentsPage from '../pages/NPP/AgentsPage';
import NPPAddAgentPage from '../pages/NPP/AddAgentPage';
import NPPUpdateAgentPage from '../pages/NPP/UpdateAgentPage';
import NPPBalancePage from '../pages/NPP/BalancePage';
import NPPTransactionDetailPage from '../pages/NPP/TransactionDetailPage';
import NPPWithdrawalRequestPage from '../pages/NPP/WithdrawalRequestPage';

//DLpages
import DLDashboardPage from '../pages/DL/DashboardPage';
import DLOrdersPage from '../pages/DL/OrdersPage';
import DLCommissionPage from '../pages/DL/CommissionPage';
import DLPayCommissionPage from '../pages/DL/PayCommissionPage';
import DLCTVPage from '../pages/DL/CTVPage';
import DLAddCTVPage from '../pages/DL/AddCTVPage';
import DLUpdateCTVPage from '../pages/DL/UpdateCTVPage';
import DLProductPage from '../pages/DL/ProductPage';
import DLProductCommissionFormPage from '../pages/DL/ProductCommissionFormPage';
import DLBalancePage from '../pages/DL/BalancePage';
import DLWithdrawalRequestPage from '../pages/DL/WithdrawalRequestPage';
import DLTransactionDetailPage from '../pages/DL/TransactionDetailPage';

// CTV Pages
import CtvDashboardPage from '../pages/CTV/DashboardPage';
import ProductPage from '../pages/CTV/ProductPage';
// ... import các trang khác của CTV (nếu có)


import ProtectedRoute from './ProtectedRoute';


const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<RegisterPage />} />

        {/* --- Route cha dùng chung cho tất cả các trang cần bảo vệ (NPP & CTV) --- */}
        <Route element={<ProtectedRoute />}>
        
            {/* --- Cấu hình cho NPP: NppLayout là layout cha cung cấp context --- */}
            <Route path="/npp" element={<Layout />}>
              <Route index element={<Navigate to="dashboard" replace />} /> // Chuyển index về dashboard
              <Route path="dashboard" element={<NPPDashboardPage />} />
              <Route path="agents" element={<NPPAgentsPage />} />
              <Route path="agents/new" element={<NPPAddAgentPage />} />
              <Route path="agents/edit/:id" element={<NPPUpdateAgentPage />} />
              <Route path="orders" element={<NPPOrdersPage />} />
              <Route path="commissions" element={<NPPCommissionPage />} />
              <Route path="commissions/pay/:id" element={<NPPPayCommissionPage />} />
              <Route path="balance" element={<NPPBalancePage />} />
              <Route path="withdrawal" element={<NPPWithdrawalRequestPage />} />
              <Route path="transaction/:id" element={<NPPTransactionDetailPage />} />
            </Route>
            <Route path="/dl" element={<Layout />}>
              <Route index element={<Navigate to="dashboard" replace />} /> // Chuyển index về dashboard
              <Route path="dashboard" element={<DLDashboardPage />} />
              <Route path="orders" element={<DLOrdersPage />} />
              <Route path="commissions" element={<DLCommissionPage />} />
              <Route path="commissions/pay/:id" element={<DLPayCommissionPage />} />
              <Route path="CTV" element={<DLCTVPage />} />
              <Route path="ctv/new" element={<DLAddCTVPage />} />
              <Route path="ctv/edit/:id" element={<DLUpdateCTVPage />} />
              <Route path="products" element={<DLProductPage />} />
              <Route path="products/commission/edit/:id" element={<DLProductCommissionFormPage />} /> 
              <Route path="balance" element={<DLBalancePage />} />
              <Route path="withdrawal" element={<DLWithdrawalRequestPage />} />
              <Route path="balance/transaction/:id" element={<DLTransactionDetailPage />} />
            </Route>

            {/* --- Cấu hình cho CTV: CtvLayout là layout cha cung cấp context --- */}
            <Route path="/ctv" element={<Layout />}>
              <Route index element={<Navigate to="dashboard" replace />} /> // Chuyển index về dashboard
              <Route path="dashboard" element={<CtvDashboardPage />} />
              <Route path="products" element={<ProductPage />} />
              {/* Thêm các Route CTV khác tại đây */}
            </Route>
        </Route>
        
        <Route path="/" element={<Navigate to="/npp/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;