import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Kiểm tra token khi trang được tải lại
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedUser = jwtDecode(token);
                if (decodedUser.exp * 1.0 > Date.now()) {
                    setUser(decodedUser);
                } else {
                    localStorage.removeItem('token');
                }
            } catch (error) {
                console.error("Invalid token:", error);
                localStorage.removeItem('token');
            }
        }
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
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook tùy chỉnh để sử dụng context dễ dàng hơn
export const useAuth = () => {
    return useContext(AuthContext);
};