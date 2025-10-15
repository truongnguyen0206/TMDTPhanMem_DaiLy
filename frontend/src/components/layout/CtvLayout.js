import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar'; // Sử dụng Sidebar chung
import Header from './Header';

const CtvLayout = () => {
  // Thêm state để quản lý việc đóng/mở sidebar, giống hệt NppLayout
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [pageTitle, setPageTitle] = useState('Tổng quan'); 

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    // Sử dụng class CSS giống hệt NppLayout
    <div className="min-h-screen bg-light-gray">
      <Sidebar isOpen={isSidebarOpen} />
      <div className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="flex flex-col">
            <Header 
              toggleSidebar={toggleSidebar} 
              pageTitle={pageTitle} 
            />
            <main className="p-6">
                <Outlet context={{ setPageTitle }} />
            </main>
        </div>
      </div>
    </div>
  );
};

export default CtvLayout;