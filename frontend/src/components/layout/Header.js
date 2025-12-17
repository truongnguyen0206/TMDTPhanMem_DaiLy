import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LuSearch, LuMessageCircle, LuBell, LuMenu } from 'react-icons/lu';
import avatar from '../../assets/images/logo.png';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // <-- 1. Import

const Header = ({ toggleSidebar, pageTitle }) => {
    const { user } = useAuth();
    const { t } = useTranslation(); // <-- 2. Lấy hàm t

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
        <header className="bg-white p-4 flex items-center justify-between border-b border-border-color z-10 sticky top-0 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-white"
                    aria-label="Toggle sidebar"
                >
                    <LuMenu size={24} />
                </button>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{pageTitle}</h1>
            </div>

            <div className="flex items-center gap-6">

                <div className="flex items-center gap-4">
                    {/* (Icons giữ nguyên) */}
                    <button className="relative text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-white">
                        <LuMessageCircle size={24} />
                    </button>
                    {/* ... */}
                </div>

                {user && (
                    <Link to={getProfileLink()} className="flex items-center gap-3 cursor-pointer" title="Xem hồ sơ">
                        <div className="text-right">
                            <p className="font-semibold text-gray-800 capitalize dark:text-white">{user.username}</p>
                            {/* Có thể dịch vai trò nếu cần, nhưng thường giữ nguyên */}
                            <p className="text-xs text-text-muted dark:text-gray-400">{user.role}</p>
                        </div>
                        <img src={avatar} alt="Avatar" className="h-10 w-10 rounded-full object-cover border-2 border-primary" />
                    </Link>
                )}
            </div>
        </header>
    );
};

export default Header;
