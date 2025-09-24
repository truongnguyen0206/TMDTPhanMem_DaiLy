// src/components/layout/Header/Header.js
import React from 'react';
import './Header.css';
import { FaBell } from 'react-icons/fa';

const Header = () => {
  return (
    <div className="header">
      <div className="promo-banner">
        <p>
          <strong>Learn how to launch faster</strong>
          watch our webinar for tips from our experts and get a limited time offer.
        </p>
      </div>
      <div className="user-actions">
        <FaBell className="notification-icon" />
        <button className="logout-btn">Log out</button>
      </div>
    </div>
  );
};

export default Header;