import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
    LuLayoutDashboard, LuPackage, LuUsers, LuBadgeDollarSign, 
    LuLogOut, LuBook, LuMessageSquare, LuSettings, LuTrendingUp,
    LuDollarSign
} from 'react-icons/lu';
import { HiServerStack } from "react-icons/hi2";
import logo from '../../assets/images/logo.png';
// import logo from '../../assets/images/logo3.jpg';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { t } = useTranslation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // --- MENU CHÍNH THEO VAI TRÒ ---
    const adminMenuItems = [
        { name: t('sidebar.dashboard'), icon: <LuLayoutDashboard size={20} />, path: '/admin/dashboard' },
        { name: t('sidebar.accounts'), icon: <LuUsers size={20} />, path: '/admin/accounts' },
        { name: t('sidebar.commission'), icon: <LuTrendingUp size={20} />, path: '/admin/commission' },
        { name: t('sidebar.orders'), icon: <LuPackage size={20} />, path: '/admin/orders' },
    ];
    const nppMenuItems = [
        { name: t('sidebar.dashboard'), icon: <LuLayoutDashboard size={20} />, path: '/npp/dashboard' },
        { name: t('sidebar.orders'), icon: <LuPackage size={20} />, path: '/npp/orders' },
        { name: t('sidebar.commission'), icon: <LuTrendingUp size={20} />, path: '/npp/commissions' },
        { name: t('sidebar.agents'), icon: <LuUsers size={20} />, path: '/npp/agents' },
        { name: t('sidebar.balance'), icon: <LuBadgeDollarSign size={20} />, path: '/npp/balance' },
    ];
    const dlMenuItems = [
        { name: t('sidebar.dashboard'), icon: <LuLayoutDashboard size={20} />, path: '/dl/dashboard' },
        { name: t('sidebar.orders'), icon: <LuPackage size={20} />, path: '/dl/orders' },
        { name: t('sidebar.commission'), icon: <LuTrendingUp size={20} />, path: '/dl/commissions' },
        { name: t('sidebar.ctv'), icon: <LuUsers size={20} />, path: '/dl/CTV' },
        { name: t('sidebar.products'), icon: <HiServerStack size={20} />, path: '/dl/products' },
        { name: t('sidebar.balance'), icon: <LuBadgeDollarSign size={20} />, path: '/dl/balance' },
    ];
    const ctvMenuItems = [
        { name: t('sidebar.overview'), icon: <LuLayoutDashboard size={20} />, path: '/ctv/dashboard' },
        { name: t('sidebar.products'), icon: <LuPackage size={20} />, path: '/ctv/products' },
        { name: t('sidebar.commission'), icon: <LuDollarSign size={20} />, path: '/ctv/commission' },
        { name: t('sidebar.sales'), icon: <LuTrendingUp size={20} />, path: '/ctv/sales' },
    ];
    const otherItems = [
        { name: t('sidebar.guide'), icon: <LuBook size={20} />, path: '/guide' },
        { name: t('sidebar.messages'), icon: <LuMessageSquare size={20} />, path: '/messages' },
        { name: t('sidebar.settings'), icon: <LuSettings size={20} />, path: '/settings' },
    ];

    // --- SỬA LẠI LOGIC CHỌN MENU ---
    let menuItems = [];
    if (user?.role === 'Admin') {
        menuItems = adminMenuItems;
    } else if (user?.role === 'Nhà phân phối') { // Thêm điều kiện cho NPP
        menuItems = nppMenuItems;
    } else if (user?.role === 'Cộng tác viên') {
        menuItems = ctvMenuItems;
    } else if (user?.role === 'Đại lý') {
        menuItems = dlMenuItems;
    }

    const baseLinkClass = "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors";
    
    // Thêm các class dark: vào đây
    const inactiveLinkClass = "text-text-muted hover:bg-gray-200 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white";
    
    // Nút active không cần đổi nhiều vì nó đã có màu
    const activeLinkClass = "bg-primary text-text-primary font-semibold shadow-md";

    return (
        <aside className={`w-64 bg-light-gray border-r border-border-color flex flex-col p-4 fixed top-0 left-0 h-full z-20 
                           transform transition-transform duration-300 ease-in-out 
                           dark:bg-gray-800 dark:border-gray-700
                           ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            
            <div className="flex items-center gap-3 p-4 mb-6">
                <img src={logo} alt="Logo" className="h-10 w-10" />
                {/* Thêm class dark: cho tiêu đề */}
                <span className="text-xl font-bold text-gray-800 dark:text-white">{t('sidebar.systemManagement')}</span>
            </div>

            <nav className="flex-1 flex flex-col gap-2">
                <div>
                    {/* Thêm class dark: cho tiêu đề Menu */}
                    <h3 className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider dark:text-gray-500">Menu</h3>
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}
                            end={!item.path.includes('/', 1)}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </div>
                
                <div className="mt-4">
                     {/* Thêm class dark: cho tiêu đề Khác */}
                     <h3 className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider dark:text-gray-500">{t('sidebar.others')}</h3>
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
                {/* (Nút logout không cần đổi vì đã có màu nổi) */}
                <button
                    onClick={handleLogout}
                    className="w-full bg-custom-blue text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                    <LuLogOut size={20} />
                    <span>{t('sidebar.logout')}</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;