import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';
import NppLayout from '../components/layout/NppLayout';
import DashboardPage from '../pages/NPP/DashboardPage';
import OrdersPage from '../pages/NPP/OrdersPage';
import CommissionPage from '../pages/NPP/CommissionPage';
import PayCommissionPage from '../pages/NPP/PayCommissionPage';
import AgentsPage from '../pages/NPP/AgentsPage';
import AddAgentPage from '../pages/NPP/AddAgentPage';
import UpdateAgentPage from '../pages/NPP/UpdateAgentPage';
import BalancePage from '../pages/NPP/BalancePage';
import TransactionDetailPage from '../pages/NPP/TransactionDetailPage';
import WithdrawalRequestPage from '../pages/NPP/WithdrawalRequestPage'; // <-- THÊM DÒNG NÀY
import ProtectedRoute from './ProtectedRoute';

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<NppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/commission" element={<CommissionPage />} />
            <Route path="/commission/pay/:id" element={<PayCommissionPage />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/agents/new" element={<AddAgentPage />} />
            <Route path="/agents/edit/:id" element={<UpdateAgentPage />} />
            <Route path="/balance" element={<BalancePage />} />
            <Route path="/balance/transaction/:id" element={<TransactionDetailPage />} />
            <Route path="/balance/withdraw" element={<WithdrawalRequestPage />} /> {/* <-- THÊM DÒNG NÀY */}
          </Route>
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;