import React from 'react';
import { FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate

const Header = () => {
  const navigate = useNavigate(); // 2. Khởi tạo hook

  // 3. Tạo hàm xử lý đăng xuất
  const handleLogout = () => {
    // Xóa token khỏi localStorage
    localStorage.removeItem('token');
    // Chuyển hướng người dùng về trang đăng nhập
    navigate('/login');
  };

  return (
    <div className="flex justify-between items-center p-5 bg-white border-b border-gray-200">
      {/* Phần này bạn có thể giữ lại hoặc thay đổi tùy ý */}
      <div className="promo-banner">
        <p className="m-0 text-sm text-gray-600">
          <strong>Learn how to launch faster</strong>
          watch our webinar for tips from our experts and get a limited time offer.
        </p>
      </div>

      <div className="flex items-center">
        <FaBell className="text-xl text-gray-500 mr-5 cursor-pointer" />
        {/* 4. Thêm sự kiện onClick vào nút Log out */}
        <button 
          onClick={handleLogout} 
          className="bg-gray-100 border border-gray-200 text-gray-700 py-2 px-4 rounded-md cursor-pointer font-medium hover:bg-gray-200"
        >
          Log out
        </button>
      </div>
    </div>
  );
};

export default Header;