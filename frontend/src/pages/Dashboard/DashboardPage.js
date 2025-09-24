// src/pages/Dashboard/DashboardPage.js
import React from 'react';
import './DashboardPage.css';
import { FaUserPlus, FaHeadset } from 'react-icons/fa';

const ActionCard = ({ title, subtitle }) => (
  <div className="action-card">
    <div className="action-card-icon">
      <FaUserPlus />
    </div>
    <div className="action-card-text">
      <h4>{title}</h4>
      <p>{subtitle}</p>
    </div>
  </div>
);

const DashboardPage = () => {
  return (
    <div className="dashboard-page">
      <div className="welcome-section">
        <h2>Welcome to your dashboard, An</h2>
        <p className="email">phamdanger10@gmail.com</p>
      </div>

      <div className="action-cards-container">
        <ActionCard title="Thêm Nhân Viên" subtitle="Title" />
        <ActionCard title="Thêm Cộng Tác Viên" subtitle="Title" />
        <ActionCard title="Thêm Đại Lý" subtitle="Title" />
      </div>

      <button className="support-btn">
        <FaHeadset /> Support
      </button>
    </div>
  );
};

export default DashboardPage;