// Cập nhật tệp: src/index.js

import React from 'react'; // <-- Import React
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import './i18n'; // Import i18n

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Thêm Suspense bao bọc App */}
    <React.Suspense fallback={<div>Đang tải ngôn ngữ...</div>}> {/* Bạn có thể tùy chỉnh fallback UI */}
      <App />
    </React.Suspense>
  </React.StrictMode>
);