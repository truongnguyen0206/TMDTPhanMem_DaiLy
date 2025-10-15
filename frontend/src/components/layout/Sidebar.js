import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
    LuLayoutDashboard, LuPackage, LuUsers, LuBadgeDollarSign, 
    LuLogOut, LuBook, LuMessageSquare, LuSettings, LuTrendingUp,
    LuShoppingBag, LuDollarSign, LuUser 
} from 'react-icons/lu';
import logo from '../../assets/images/logo.png';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // --- MENU CHÍNH THEO VAI TRÒ ---
    const nppMenuItems = [
        { name: 'Dashboard', icon: <LuLayoutDashboard size={20} />, path: '/' },
        { name: 'Đơn hàng', icon: <LuPackage size={20} />, path: '/orders' },
        { name: 'Hoa hồng', icon: <LuTrendingUp size={20} />, path: '/commission' },
        { name: 'Đại lý', icon: <LuUsers size={20} />, path: '/agents' },
        { name: 'Số dư', icon: <LuBadgeDollarSign size={20} />, path: '/balance' },
    ];

    const ctvMenuItems = [
        { name: 'Tổng quan', icon: <LuLayoutDashboard size={20} />, path: '/ctv/dashboard' },
        { name: 'Sản Phẩm', icon: <LuPackage size={20} />, path: '/ctv/products' },
        { name: 'Hoa hồng', icon: <LuDollarSign size={20} />, path: '/ctv/commission' },
        { name: 'Doanh số', icon: <LuTrendingUp size={20} />, path: '/ctv/sales' },
    ];

    // --- MENU "KHÁC" DÙNG CHUNG ---
    // Đưa phần này ra ngoài để áp dụng cho tất cả các role
    const otherItems = [
        { name: 'Hướng dẫn', icon: <LuBook size={20} />, path: '/guide' },
        { name: 'Nhắn tin', icon: <LuMessageSquare size={20} />, path: '/messages' },
        { name: 'Cài đặt', icon: <LuSettings size={20} />, path: '/settings' },
    ];

    // Chỉ gán menu chính dựa vào vai trò
    let menuItems = [];
    if (user?.role === 'Admin') { // Thay 'Admin' bằng vai trò NPP của bạn
        menuItems = nppMenuItems;
    } else if (user?.role === 'CTV') { // Thay 'CTV' bằng vai trò CTV của bạn
        menuItems = ctvMenuItems;
    }

    const baseLinkClass = "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors";
    const inactiveLinkClass = "text-text-muted hover:bg-gray-200 hover:text-gray-900";
    const activeLinkClass = "bg-primary text-text-primary font-semibold shadow-md";

    return (
        <aside className={`w-64 bg-light-gray border-r border-border-color flex flex-col p-4 fixed top-0 left-0 h-full z-20 
                           transform transition-transform duration-300 ease-in-out 
                           ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex items-center gap-3 p-4 mb-6">
                <img src={logo} alt="Logo" className="h-10 w-10" />
                <span className="text-xl font-bold text-gray-800">Hệ thống quản lý</span>
            </div>

            <nav className="flex-1 flex flex-col gap-2">
                <div>
                    <h3 className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Menu</h3>
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}
                            end={item.path === '/'}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </div>

                {/* Phần này bây giờ sẽ luôn được hiển thị vì otherItems luôn có dữ liệu */}
                <div className="mt-4">
                    <h3 className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Khác</h3>
                    {otherItems.map((item) => (
                         <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </div>
            </nav>

            <div className="mt-auto">
                <button
                    onClick={handleLogout}
                    className="w-full bg-custom-blue text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                    <LuLogOut size={20} />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;