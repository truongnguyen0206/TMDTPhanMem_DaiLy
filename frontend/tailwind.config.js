/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'custom-blue': '#007AFF',
        'custom-Forgot-Password': '#6358DC',
        // THAY ĐỔI DÒNG DƯỚI ĐÂY
        'primary': '#E5F2FF', // <-- Đã thay đổi từ #4F46E5
        // Màu nền chính của ứng dụng
        'light-gray': '#F9FAFB',
        // màu chữ cho các mục được chọn
        'text-primary': '#007AFF',
        // Màu chữ cho các mục không được chọn
        'text-muted': '#6B7280',
        // Màu viền
        'border-color': '#E5E7EB'
      },
    },
  },
  plugins: [],
}