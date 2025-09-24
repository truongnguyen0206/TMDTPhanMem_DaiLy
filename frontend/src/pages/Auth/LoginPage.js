// src/pages/Auth/LoginPage.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const [schoolName, setSchoolName] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5001/auth/login", {
        username,
        password,
      });
      setMessage(res.data.message);
      localStorage.setItem("token", res.data.token); // lưu token
    } catch (err) {
      setMessage(err.response?.data?.message || "Lỗi đăng nhập");
    }
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
                placeholder="Username"
                className="w-full mb-4 p-2 border rounded"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                placeholder="Password"
                className="w-full mb-4 p-2 border rounded"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
