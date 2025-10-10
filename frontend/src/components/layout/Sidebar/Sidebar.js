import React, { useState, useEffect } from 'react'; // Import thêm useState và useEffect
import { 
  FaTachometerAlt, FaUsers, FaChartBar, FaReceipt, 
  FaCog, FaTicketAlt, FaRocket, FaFileInvoice 
} from 'react-icons/fa';
import { NavLink } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Import thư viện giải mã token

const Sidebar = () => {
  const [username, setUsername] = useState(''); // State để lưu tên người dùng

  // Lấy và giải mã token khi component được render
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        // Giả sử tên người dùng được lưu trong trường 'username' của token
        setUsername(decodedToken.username); 
      } catch (error) {
        console.error("Lỗi giải mã token:", error);
      }
    }
  }, []); // Mảng rỗng [] đảm bảo useEffect chỉ chạy 1 lần

  const menuItems = [
    { path: '/', title: 'Dashboard', icon: <FaTachometerAlt className="text-lg" /> },
    { path: '/accounts', title: 'Quản Lý Tài Khoản', icon: <FaUsers className="text-lg" /> },
    { path: '/commissions', title: 'Hoa Hồng', icon: <FaReceipt className="text-lg" /> },
    { path: '/orders', title: 'Quản lý đơn hàng phát sinh', icon: <FaFileInvoice className="text-lg" /> },
    { path: '/reports', title: 'Báo Cáo', icon: <FaChartBar className="text-lg" /> },
    { path: '/settings', title: 'Settings and profile', icon: <FaCog className="text-lg" /> },
    { path: '/tickets', title: 'Ticket', icon: <FaTicketAlt className="text-lg" /> },
  ];

  return (
    <div className="w-64 bg-gray-900 text-gray-400 flex flex-col h-screen fixed left-0 top-0 shadow-lg">
      <div className="p-5 text-center border-b border-gray-800">
        <div className="w-12 h-12 rounded-full mx-auto mb-2.5 flex items-center justify-center font-bold text-2xl bg-gradient-to-r from-purple-500 to-pink-500">
          {/* Lấy 2 chữ cái đầu của username để hiển thị */}
          <span className="text-white">{username ? username.substring(0, 2).toUpperCase() : ''}</span>
        </div>
        {/* Hiển thị tên người dùng đã lấy được từ state */}
        <h3 className="text-white m-0 text-base capitalize">{username}</h3>
      </div>
      <ul className="list-none p-5 m-0 flex-grow overflow-y-auto">
        {menuItems.map((item, index) => (
          <li key={index}>
            <NavLink 
              to={item.path} 
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center py-3 px-4 my-1 rounded-lg transition-colors duration-200 
                ${isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-blue-800 hover:text-white'}`
              }
            >
              {item.icon} <span className="ml-4">{item.title}</span>
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="p-5 mt-auto">
        <button className="bg-gray-800 text-gray-400 border-none p-3 w-full rounded-lg cursor-pointer flex items-center justify-center hover:bg-gray-700 transition-colors duration-200">
          <FaRocket className="mr-2.5" /> Features <span className="bg-blue-500 text-white py-0.5 px-1.5 rounded text-xs ml-auto">NEW</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;