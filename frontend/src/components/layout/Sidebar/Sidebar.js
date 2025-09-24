// src/components/layout/Sidebar/Sidebar.js
import React, { useState } from 'react';
import './Sidebar.css';
import { 
  FaTachometerAlt, FaUsers, FaChartBar, FaReceipt, 
  FaCog, FaTicketAlt, FaRocket, FaChevronRight 
} from 'react-icons/fa';
import { NavLink, useLocation } from 'react-router-dom';

const SubMenu = ({ item }) => {
  const [isSubMenuOpen, setSubMenuOpen] = useState(false);
  const location = useLocation();

  // Mặc định mở submenu nếu route con đang active
  React.useEffect(() => {
    if (item.children.some(child => location.pathname.startsWith(child.path))) {
      setSubMenuOpen(true);
    }
  }, [location.pathname, item.children]);


  const toggleSubMenu = () => {
    setSubMenuOpen(!isSubMenuOpen);
  };

  return (
    <li className={isSubMenuOpen ? 'open' : ''}>
      <div className="menu-item" onClick={toggleSubMenu}>
        <div className="menu-link">
          {item.icon} {item.title}
        </div>
        <FaChevronRight className="menu-arrow" />
      </div>
      {isSubMenuOpen && (
        <ul className="submenu">
          {item.children.map((child, index) => (
            <li key={index}>
              <NavLink to={child.path}>{child.title}</NavLink>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

const Sidebar = () => {
  const menuItems = [
    { path: '/', title: 'Dashboard', icon: <FaTachometerAlt /> },
    { 
      title: 'Quản Lý Tài Khoản', 
      icon: <FaUsers />,
      children: [
        { path: '/accounts/agents', title: 'Đại Lý' },
        { path: '/accounts/staff', title: 'Nhân Viên' },
        { path: '/accounts/collaborators', title: 'Cộng Tác Viên' },
      ]
    },
    { 
      title: 'Hoa Hồng', 
      icon: <FaReceipt />,
      children: [
        { path: '/commission/agents', title: 'Đại Lý' },
        { path: '/commission/staff', title: 'Nhân Viên' },
        { path: '/commission/collaborators', title: 'Cộng Tác Viên' },
      ]
    },
    { path: '/reports', title: 'Báo Cáo', icon: <FaChartBar /> },
    { path: '/settings', title: 'Settings and profile', icon: <FaCog /> },
    { path: '/tickets', title: 'Ticket', icon: <FaTicketAlt /> },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-m">M</span>
          <span className="logo-n">N</span>
        </div>
        <h3>Phạm Đăng An</h3>
      </div>
      <ul className="sidebar-menu">
        {menuItems.map((item, index) => 
          item.children ? (
            <SubMenu item={item} key={index} />
          ) : (
            <li key={index}>
              <NavLink to={item.path} end>
                {item.icon} {item.title}
              </NavLink>
            </li>
          )
        )}
      </ul>
      <div className="sidebar-footer">
        <button className="features-btn">
          <FaRocket /> Features <span className="new-badge">NEW</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;