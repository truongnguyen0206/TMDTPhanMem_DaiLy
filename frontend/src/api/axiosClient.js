import axios from 'axios';

// Tạo một instance của axios với cấu hình riêng
const axiosClient = axios.create({
  baseURL: 'http://localhost:5001', // URL gốc của backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm một "interceptor" để tự động gắn token vào mỗi request
// Interceptor này sẽ chạy trước khi request được gửi đi
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosClient;