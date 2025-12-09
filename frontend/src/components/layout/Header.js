import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LuSearch, LuMessageCircle, LuBell, LuMenu } from 'react-icons/lu';
import avatar from '../../assets/images/logo.png';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Nhận thêm prop pageTitle
const Header = ({ toggleSidebar, pageTitle }) => {
    const { user } = useAuth();
    const { t } = useTranslation();

    const getProfileLink = () => {
        if (!user) return '#';
        switch (user.role) {
            case 'Admin':
                return '/admin/profile';
            case 'Nhà phân phối':
                return '/npp/profile'; // Bạn sẽ cần tạo trang /npp/profile
            case 'Đại lý':
                return '/dl/profile'; // Bạn sẽ cần tạo trang /dl/profile
            case 'Cộng tác viên':
                return '/ctv/profile'; // Bạn sẽ cần tạo trang /ctv/profile
            default:
                return '#';
        }
    }

    return (
        <header className="bg-white p-4 flex items-center justify-between border-b border-border-color z-10 sticky top-0">
            <div className="flex items-center gap-4">
                <button 
                    onClick={toggleSidebar} 
                    className="text-gray-500 hover:text-primary"
                    aria-label="Toggle sidebar"
                >
                    <LuMenu size={24} />
                </button>
                {/* Hiển thị tiêu đề động */}
                <h1 className="text-2xl font-bold text-gray-800">{pageTitle}</h1>
            </div>

            {/* Phần bên phải không thay đổi */}
            <div className="flex items-center gap-6">
                <div className="relative w-64 hidden md:block">
                    <input
                        type="text"
                        placeholder="Search here..."
                        className="w-full bg-light-gray border border-border-color rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>

                <div className="flex items-center gap-4">
                    <button className="relative text-gray-500 hover:text-primary">
                        <LuMessageCircle size={24} />
                    </button>
                    <button className="relative text-gray-500 hover:text-primary">
                        <LuBell size={24} />
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 justify-center items-center text-xs text-white">3</span>
                        </span>
                    </button>
                </div>
                
                {user && (
                    <Link to={getProfileLink()} className="flex items-center gap-3 cursor-pointer" title="Xem hồ sơ">
                        <div className="text-right">
                            <p className="font-semibold text-gray-800 capitalize">{user.username}</p>
                            <p className="text-xs text-text-muted">{user.role}</p>
                        </div>
                        <img src={avatar} alt="Avatar" className="h-10 w-10 rounded-full object-cover border-2 border-primary" />
                    </Link>
                )}
            </div>
        </header>
    );
};

export default Header;