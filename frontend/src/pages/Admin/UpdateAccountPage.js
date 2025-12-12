import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext, useNavigate, useParams } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

// TẠO MỘT DANH SÁCH VAI TRÒ TĨNH (HARD-CODED)
const STATIC_ROLES = [
    { role_id: 1, role_name: 'Admin' },
    { role_id: 2, role_name: 'Nhà phân phối' },
    { role_id: 3, role_name: 'Đại lý' },
    { role_id: 4, role_name: 'Cộng tác viên' },
    { role_id: 5, role_name: 'Khách hàng' }
];

const UpdateAccountPage = () => {
    const { setPageTitle } = useOutletContext();
    const navigate = useNavigate();
    const { id } = useParams(); 

    // Dữ liệu form hiện tại
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        password: '', 
        role_id: '',
        status: ''
    });

    // 🆕 State lưu dữ liệu gốc để so sánh
    const [initialData, setInitialData] = useState(null);
    
    // Sử dụng danh sách tĩnh
    const [roles] = useState(STATIC_ROLES); 
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        setPageTitle('Cập nhật Tài khoản');

        const fetchData = async () => {
            try {
                // Lấy thông tin tài khoản hiện tại
                console.log(`ĐANG GỌI API: /users/${id}`);
                const userResponse = await axiosClient.get(`/users/${id}`);
                
                console.log(`THÀNH CÔNG API /users/${id} (DATA):`, userResponse.data); 
                const userData = userResponse.data;
                
                if (userData) {
                    const data = {
                        username: userData.username || '',
                        email: userData.email || '',
                        phone: userData.phone || '',
                        password: '', // Mật khẩu luôn rỗng ban đầu
                        role_id: userData.role_id || '',
                        status: userData.status || ''
                    };
                    setFormData(data);
                    setInitialData(data); // 🆕 Lưu dữ liệu gốc
                } else {
                     setMessage({ text: 'Không tìm thấy dữ liệu tài khoản.', type: 'error' });
                }

            } catch (error) {
                console.error("LỖI KHI TẢI DỮ LIỆU USER:", error.response ? error.response.data : error.message);
                setMessage({ text: `Lỗi khi tải dữ liệu User. ${error.response?.data?.message || error.message}`, type: 'error' });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [setPageTitle, id]);

    // 🆕 Tính toán xem có thay đổi hay không
    const isChanged = useMemo(() => {
        if (!initialData) return false;
        
        return (
            formData.username !== initialData.username ||
            formData.email !== initialData.email ||
            formData.phone !== initialData.phone ||
            // Password có nhập là có thay đổi
            formData.password !== '' || 
            // So sánh lỏng (==) để xử lý trường hợp string vs number của select box
            // eslint-disable-next-line eqeqeq
            formData.role_id != initialData.role_id || 
            formData.status !== initialData.status
        );
    }, [formData, initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Chặn submit nếu không có thay đổi
        if (!isChanged) return;

        setMessage({ text: 'Đang xử lý...', type: 'info' });

        const payload = {
            username: formData.username,
            email: formData.email,
            phone: formData.phone,
            password: formData.password, 
            role_id: parseInt(formData.role_id, 10),
            status: formData.status
        };

        console.log("ĐANG GỬI (SUBMIT) DỮ LIỆU:", payload);

        try {
            await axiosClient.put(`/users/updateUser/${id}`, payload);
            setMessage({ text: 'Cập nhật tài khoản thành công!', type: 'success' });
            setTimeout(() => navigate('/admin/accounts'), 1500);

        } catch (error) {
            console.error("LỖI KHI CẬP NHẬT (SUBMIT):", error.response ? error.response.data : error.message);
            setMessage({ text: 'Cập nhật thất bại. ' + (error.response?.data?.message || error.message), type: 'error' });
        }
    };
    
    if (loading) { // Chỉ loading nếu chưa có data
        return <div className="text-center p-10">Đang tải dữ liệu tài khoản...</div>;
    }

    return (
        <div className="bg-white p-8 rounded-xl border border-gray-200 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Cập nhật Tài khoản (ID: {id})</h2>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Tên tài khoản */}
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Tên tài khoản (Username)</label>
                        <input type="text" name="username" id="username" value={formData.username} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" required />
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" required />
                    </div>
                    
                    {/* Số điện thoại */}
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Số Điện Thoại</label>
                        <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" />
                    </div>

                    {/* Mật khẩu mới */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                        <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="Bỏ trống nếu không đổi" />
                    </div>

                    {/* Vai trò (role_id) */}
                    <div>
                        <label htmlFor="role_id" className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                        <select name="role_id" id="role_id" value={formData.role_id} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" required>
                            <option value="">-- Chọn vai trò --</option>
                            {/* Map các roles từ danh sách TĨNH */}
                            {roles.map(role => (
                                <option key={role.role_id} value={role.role_id}>
                                    {role.role_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Trạng thái (status) */}
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                        <select name="status" id="status" value={formData.status} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" required>
                            <option value="Đang chờ cấp tài khoản">Đang chờ cấp tài khoản</option>
                            <option value="Đang hoạt động">Đang hoạt động</option>
                            <option value="Ngừng hoạt động">Ngừng hoạt động</option>
                        </select>
                    </div>
                </div>

                {message.text && (
                     <p className={`text-center mt-6 text-sm ${message.type === 'error' ? 'text-red-600' : message.type === 'success' ? 'text-green-600' : 'text-gray-600'}`}>
                        {message.text}
                    </p>
                )}

                <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
                     <button type="button" onClick={() => navigate('/admin/accounts')} className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors">
                        Hủy
                    </button>
                    
                    {/* 🆕 NÚT CẬP NHẬT: Thay đổi màu sắc dựa trên isChanged */}
                    <button 
                        type="submit" 
                        className={`font-bold py-2 px-8 rounded-lg transition-colors ${
                            isChanged 
                            ? 'bg-blue-600 text-white hover:bg-blue-700'  // Sáng lên khi có thay đổi
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed' // Tối đi khi chưa đổi
                        }`} 
                        disabled={loading || !isChanged}
                    >
                        {loading ? 'Đang lưu...' : 'Cập nhật'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UpdateAccountPage;