// src/components/layout/MainLayout/MainLayout.js
import React from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-grow flex flex-col">
        <Header />
        <main className="flex-grow">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;