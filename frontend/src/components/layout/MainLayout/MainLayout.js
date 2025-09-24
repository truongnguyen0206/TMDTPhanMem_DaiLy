// src/components/layout/MainLayout/MainLayout.js
import React from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';
import { Outlet } from 'react-router-dom';
import './MainLayout.css';

const MainLayout = () => {
  return (
    <div className="main-layout">
      <Sidebar />
      <div className="content-wrapper">
        <Header />
        <main className="page-content">
          <Outlet /> {/* Đây là nơi các component của page sẽ được render */}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;