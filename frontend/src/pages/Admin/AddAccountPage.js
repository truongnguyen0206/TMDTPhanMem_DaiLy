import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

// Danh sách vai trò cố định (Khớp với DB)
const STATIC_ROLES = [
    { role_id: 2, role_name: 'Nhà phân phối' },
    { role_id: 3, role_name: 'Đại lý' },
    { role_id: 4, role_name: 'Cộng tác viên' },
    { role_id: 5, role_name: 'Khách hàng' }
];

const AddAccountPage = () => {
    const { setPageTitle } = useOutletContext();
    const navigate = useNavigate();
    
    // Tab: 'manually' hoặc 'csv'
    const [activeTab, setActiveTab] = useState('manually');

    // State Form - Đã xóa cccd và tier cho khớp DB
    const [formData, setFormData] = useState({
        username: '',  // Map với BE: username
        email: '',
        password: '',
        phone: '',
        role_id: '',   // Map với BE: role_id
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        setPageTitle('Thêm Tài Khoản Mới');
    }, [setPageTitle]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        setLoading(true);

        // 1. Validate cơ bản
        if (!formData.role_id) {
            setMessage({ text: 'Vui lòng chọn vai trò cho tài khoản.', type: 'error' });
            setLoading(false);
            return;
        }

        // 2. Chuẩn bị dữ liệu gửi đi (Khớp với BE user_controller.createUser)
        const payload = {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            role_id: parseInt(formData.role_id, 10)
        };

        try {
            // 3. Gọi API (Lưu ý: API này cần Auth & Role Admin như đã sửa ở bước trước)
            await axiosClient.post('/users/createUser', payload);
            
            setMessage({ text: 'Tạo tài khoản thành công!', type: 'success' });
            
            // Chuyển trang sau 1.5s
            setTimeout(() => navigate('/admin/accounts'), 1500);

        } catch (error) {
            console.error("Lỗi khi tạo tài khoản:", error);
            const errorMsg = error.response?.data?.message || error.message || 'Có lỗi xảy ra.';
            setMessage({ text: `Tạo thất bại: ${errorMsg}`, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-xl border border-gray-200 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Thêm Tài Khoản</h2>

            {/* Tabs chuyển đổi */}
            <div className="flex border-b mb-6">
                <button
                    onClick={() => setActiveTab('manually')}
                    className={`py-2 px-4 text-sm font-medium transition-colors ${activeTab === 'manually' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Thêm thủ công
                </button>
                <button
                    onClick={() => setActiveTab('csv')}
                    className={`py-2 px-4 text-sm font-medium transition-colors ${activeTab === 'csv' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Nhập từ Excel/CSV
                </button>
            </div>

            {/* FORM THÊM THỦ CÔNG */}
            {activeTab === 'manually' && (
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {/* --- Cột Trái: Thông tin đăng nhập cơ bản --- */}
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Tên tài khoản / Họ tên <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" name="username" id="username" 
                                    value={formData.username} onChange={handleChange} 
                                    placeholder="Ví dụ: nguyenvan_a"
                                    className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" 
                                    required 
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                                <input 
                                    type="email" name="email" id="email" 
                                    value={formData.email} onChange={handleChange} 
                                    className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" 
                                    required 
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu <span className="text-red-500">*</span></label>
                                <input 
                                    type="password" name="password" id="password" 
                                    value={formData.password} onChange={handleChange} 
                                    className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" 
                                    required 
                                />
                            </div>
                        </div>

                        {/* --- Cột Phải: Thông tin bổ sung & Vai trò --- */}
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                <input 
                                    type="tel" name="phone" id="phone" 
                                    value={formData.phone} onChange={handleChange} 
                                    className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" 
                                />
                            </div>

                            {/* Chuyển Role sang cột phải cho cân đối */}
                            <div>
                                <label htmlFor="role_id" className="block text-sm font-medium text-gray-700 mb-1">Vai trò <span className="text-red-500">*</span></label>
                                <select 
                                    name="role_id" id="role_id" 
                                    value={formData.role_id} onChange={handleChange} 
                                    className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none cursor-pointer"
                                    required
                                >
                                    <option value="">-- Chọn vai trò --</option>
                                    {STATIC_ROLES.map(role => (
                                        <option key={role.role_id} value={role.role_id}>
                                            {role.role_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Thông báo lỗi/thành công */}
                    {message.text && (
                        <div className={`mt-6 p-3 rounded-lg text-center text-sm font-medium ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="mt-8 flex gap-4">
                        <button 
                            type="button"
                            onClick={() => navigate('/admin/accounts')}
                            className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`px-8 py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors flex-1 md:flex-none ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Đang xử lý...' : 'Tạo tài khoản'}
                        </button>
                    </div>
                </form>
            )}

            {/* TAB IMPORT CSV (Giữ nguyên placeholder) */}
            {activeTab === 'csv' && (
                <div className="py-10 text-center border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500 mb-4">Tính năng Import CSV đang được phát triển.</p>
                    <button className="text-primary font-medium hover:underline">Tải mẫu file CSV</button>
                </div>
            )}
        </div>
    );
};

export default AddAccountPage;