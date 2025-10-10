import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

const AccountFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        phone: '',
        role_id: 4, 
    });
    
    const [roles, setRoles] = useState([]);

    useEffect(() => {
        setRoles([
            { role_id: 1, role_name: 'Admin' },
            { role_id: 2, role_name: 'NhanVien' },
            { role_id: 3, role_name: 'DaiLy' },
            { role_id: 4, role_name: 'CTV' }
        ]);
    }, []);

    useEffect(() => {
        if (isEditing) {
            const fetchUser = async () => {
                try {
                    const res = await axiosClient.get(`/users/${id}`);
                    const { username, email, phone, role_id } = res.data;
                    setFormData({ username, email, phone, role_id, password: '' });
                } catch (error) {
                    console.error("Không thể lấy dữ liệu người dùng!", error);
                }
            };
            fetchUser();
        }
    }, [id, isEditing]);

    // ---- HÀM BỊ THIẾU NẰM Ở ĐÂY ----
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    // -------------------------------

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const payload = {
            username: formData.username,
            email: formData.email,
            phone: formData.phone,
            role_id: parseInt(formData.role_id, 10),
        };

        try {
            if (isEditing) {
                await axiosClient.put(`/users/${id}`, payload);
                alert("Đã cập nhật thông tin tài khoản!");
            } else {
                if (!formData.password) {
                    alert("Vui lòng nhập mật khẩu!");
                    return;
                }
                payload.password = formData.password;
                await axiosClient.post('/users', payload);
                alert("Đã thêm tài khoản mới!");
            }
            navigate('/accounts');
        } catch (error) {
            console.error("Lỗi khi lưu thông tin:", error);
            alert(error.response?.data?.message || "Đã xảy ra lỗi.");
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
                {isEditing ? 'Cập Nhật Tài Khoản' : 'Thêm Tài Khoản'}
            </h1>
            <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="md:col-span-2">
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <input
                                id="username" type="text" name="username" value={formData.username} onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                id="email" type="email" name="email" value={formData.email} onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Số Điện Thoại</label>
                            <input
                                id="phone" type="text" name="phone" value={formData.phone} onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        {!isEditing && (
                            <div className="md:col-span-2">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    id="password" type="password" name="password" value={formData.password} onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        )}
                        <div className="md:col-span-2">
                            <label htmlFor="role_id" className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                            <select id="role_id" name="role_id" value={formData.role_id} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                {roles.map(role => (
                                    <option key={role.role_id} value={role.role_id}>{role.role_name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-start">
                        <button type="submit" className="px-6 py-2 text-white font-semibold bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                            {isEditing ? 'Lưu thay đổi' : 'Thêm mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AccountFormPage;