import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [pageTitle, setPageTitle] = useState('Dashboard'); // Thêm state cho tiêu đề

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-light-gray">
      <Sidebar isOpen={isSidebarOpen} />
      <div className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="flex flex-col">
            {/* Truyền pageTitle và toggleSidebar xuống Header */}
            <Header 
              toggleSidebar={toggleSidebar} 
              pageTitle={pageTitle} 
            />
            <main className="p-6">
                {/* Truyền hàm setPageTitle xuống cho các trang con */}
                <Outlet context={{ setPageTitle }} />
            </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;