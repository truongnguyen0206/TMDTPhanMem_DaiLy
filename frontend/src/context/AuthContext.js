import { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axiosClient from '../api/axiosClient';
import { disconnectSocket } from '../realtime/socketClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    // THÊM MỚI: State để theo dõi quá trình kiểm tra token ban đầu
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedUser = jwtDecode(token);
                // SỬA LỖI: JWT 'exp' tính bằng giây, Date.now() tính bằng mili giây. Cần nhân 1000.
                if (decodedUser.exp * 1000 > Date.now()) {
                    setUser(decodedUser);
                    // CẬP NHẬT: Gắn token vào header của axiosClient ngay khi xác thực lại thành công
                    axiosClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                } else {
                    localStorage.removeItem('token');
                }
            } catch (error) {
                console.error("Invalid token:", error);
                localStorage.removeItem('token');
            }
        }
        // THÊM MỚI: Đánh dấu là đã khởi tạo xong, dù có token hay không
        setIsInitializing(false);
    }, []);

    const login = (token) => {
        const decodedUser = jwtDecode(token);
        localStorage.setItem('token', token);
        axiosClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(decodedUser);
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete axiosClient.defaults.headers.common['Authorization'];
        disconnectSocket();
        setUser(null);
    };

    // CẬP NHẬT: Cung cấp isInitializing cho các component con
    const value = { user, login, logout, isInitializing };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
