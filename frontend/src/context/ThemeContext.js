// Tệp mới: src/context/ThemeContext.js

import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // 1. Lấy theme từ localStorage hoặc mặc định là 'light'
    const [theme, setTheme] = useState(() => 
        localStorage.getItem('theme') || 'light'
    );

    useEffect(() => {
        const root = window.document.documentElement;
        
        // 2. Xóa class cũ, thêm class mới vào thẻ <html>
        root.classList.remove(theme === 'light' ? 'dark' : 'light');
        root.classList.add(theme);

        // 3. Lưu theme đã chọn vào localStorage
        localStorage.setItem('theme', theme);
    }, [theme]); // Chạy lại mỗi khi 'theme' thay đổi

    // 4. Cung cấp 'theme' và hàm 'setTheme' cho các component con
    const value = { theme, setTheme };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

// Hook tùy chỉnh để dễ dàng sử dụng context
export const useTheme = () => {
    return useContext(ThemeContext);
};