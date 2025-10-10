import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext'; // Import useAuth
import { FaEye, FaEyeSlash, FaGoogle } from 'react-icons/fa';
import LoginImage from '../../assets/images/login-logo.png';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); // Lấy hàm login từ context

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await axiosClient.post("/auth/login", {
        username,
        password,
      });
      
      const { token } = res.data;
      login(token); // Sử dụng hàm login từ context để lưu token và thông tin user
      
      navigate('/'); 
    } catch (err) {
      setMessage(err.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    }
  };

  // ... (phần return JSX giữ nguyên không đổi)
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-700 to-purple-800 items-center justify-center p-12 text-white relative">
        <div className="text-center">
            <img 
              src={LoginImage} 
              alt="Hệ thống quản lý" 
              className="max-w-md mx-auto"
            />
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-100 p-8">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Welcome to</h2>
          <h2 className="text-3xl font-bold text-custom-blue mb-8">Hệ thống quản lý </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">Tên đăng nhập</label>
              <input
                id="username"
                type="text"
                placeholder="Nhập tên đăng nhập của bạn"
                className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
                <div className="flex justify-between items-center">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                </div>
                <div className="relative mt-1">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu của bạn"
                    className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700"> </label>
                <a href="#" className="text-sm text-custom-Forgot-Password hover:underline">Quên mật khẩu?</a>
              </div>
            </div>
            {message && <p className="text-sm text-center text-red-500">{message}</p>}
            <div>
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-md font-bold hover:bg-blue-700 transition-colors">
                Đăng nhập
              </button>
            </div>
          </form>
          <div className="mt-6 flex items-center justify-center">
            <div className="border-t border-gray-300 flex-grow"></div>
            <span className="px-4 text-gray-500 text-sm">Or</span>
            <div className="border-t border-gray-300 flex-grow"></div>
          </div>
          <div className="mt-6 space-y-4">
            <button className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-md hover:bg-gray-50">
              <FaGoogle className="text-red-500" />
              <span className="text-sm font-medium text-gray-700">Sign up with Google</span>
            </button>
          </div>
          <p className="mt-8 text-center text-sm text-gray-600">
            Don't have an account? <Link to="/signup" className="text-blue-600 font-medium hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;