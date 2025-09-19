// frontend/src/App.js

import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios

function App() {
  // Tạo một state để lưu tin nhắn nhận được từ backend
  const [message, setMessage] = useState('Đang tải...');

  // Sử dụng useEffect để gọi API một lần khi component được render
  useEffect(() => {
    // Gọi API đến backend.
    // URL này phải khớp với địa chỉ và cổng của backend bạn đã cấu hình.
    axios.get('http://localhost:5001/api/test')
      .then(response => {
        // Nếu thành công, cập nhật state với tin nhắn từ response
        setMessage(response.data.message);
      })
      .catch(error => {
        // Nếu có lỗi, in ra console và cập nhật state
        console.error('Có lỗi xảy ra khi gọi API!', error);
        setMessage('Không thể kết nối đến backend. Vui lòng kiểm tra lại!');
      });
  }, []); // Mảng rỗng [] đảm bảo useEffect chỉ chạy 1 lần

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '24px' }}>
      <h1>Trạng thái kết nối</h1>
      <h2>test</h2>
      <p>{message}</p>
    </div>
  );
}

export default App;