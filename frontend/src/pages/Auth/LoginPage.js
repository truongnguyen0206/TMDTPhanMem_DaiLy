import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { jwtDecode } from 'jwt-decode'; // <-- THÊM IMPORT NÀY

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Sử dụng axiosClient, chỉ cần ghi đường dẫn con
      const res = await axiosClient.post("/auth/login", {
        username,
        password,
      });
      
      const { token } = res.data;
      localStorage.setItem("token", token);
      
      try {
        const decoded = jwtDecode(token);
        console.log("Token đã được giải mã:", decoded);
      } catch (error) {
        console.error("Lỗi giải mã token:", error);
      }
      
      navigate('/'); 
    } catch (err) {
      setMessage(err.response?.data?.message || "Lỗi đăng nhập");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="max-w-md w-full text-center">
        <header className="mb-10">
          <h1 className="text-3xl text-gray-700">Welcome, Log into your account</h1>
        </header>
        <div className="bg-white p-10 rounded-lg shadow-md">
          <p className="text-gray-500 mt-0 mb-8">It is our great pleasure to have you on board!</p>
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <input
                type="text"
                placeholder="Username"
                className="w-full p-3 border border-gray-300 rounded-md text-base placeholder-gray-400"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="mb-5">
              <input
                type="password"
                placeholder="Password"
                className="w-full p-3 border border-gray-300 rounded-md text-base placeholder-gray-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="w-full p-3 bg-blue-600 text-white border-none rounded-md text-base font-bold cursor-pointer transition-colors hover:bg-blue-700">Login</button>
          </form>
          {message && <p className="mt-4 text-center text-red-500">{message}</p>}
          <p className="mt-6 text-sm text-gray-500">
            Don't have an account? <Link to="/signup" className="text-blue-600 no-underline font-medium">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;