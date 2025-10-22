import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar'; // Chúng ta sẽ dùng chung Sidebar
import Header from './Header';

const AdminLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  // State 'pageTitle' sẽ được các trang con tự quản lý thông qua context
  const [pageTitle, setPageTitle] = useState('Dashboard'); 

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50"> {/* Dùng nền xám nhạt cho Admin */}
      <Sidebar isOpen={isSidebarOpen} />
      <div className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="flex flex-col">
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

export default AdminLayout;