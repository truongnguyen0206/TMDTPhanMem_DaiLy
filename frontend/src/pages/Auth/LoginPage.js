// src/pages/Auth/LoginPage.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const [schoolName, setSchoolName] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Xử lý logic đăng nhập ở đây
    console.log('School Name:', schoolName);
    console.log('Password:', password);
    // Ví dụ: điều hướng đến trang dashboard sau khi đăng nhập thành công
    // navigate('/');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <header className="login-header">
          <h1>Welcome, Log into your account</h1>
        </header>
        <div className="login-box">
          <p className="login-intro">It is our great pleasure to have you on board!</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Enter the name of Account"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-button">Login</button>
          </form>
          <p className="signup-link">
            Already have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;