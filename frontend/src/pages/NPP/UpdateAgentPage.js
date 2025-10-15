import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

const UpdateAgentPage = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Lấy id của đại lý từ URL
    const [formData, setFormData] = useState({
        username: '',
        address: '', // Giả sử địa chỉ chưa có trong DB, sẽ không được lưu
        phone: '',
        paymentMethod: '', // Giả sử chưa có trong DB
        email: '',
        accountInfo: '', // Giả sử chưa có trong DB
        notes: '' // Giả sử chưa có trong DB
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchAgentData = async () => {
            try {
                const response = await axiosClient.get(`/users/${id}`);
                const { username, email, phone } = response.data;
                setFormData(prevState => ({
                    ...prevState,
                    username,
                    email,
                    phone: phone || ''
                }));
            } catch (error) {
                console.error("Lỗi khi tải thông tin đại lý:", error);
                setMessage("Không thể tải thông tin đại lý.");
            } finally {
                setLoading(false);
            }
        };

        fetchAgentData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            // ===================================
            // BƯỚC 1: CẬP NHẬT BẢNG auth.users (Tên, Email, SĐT)
            // ===================================
            const userDataToUpdate = {
                username: formData.username,
                email: formData.email,
                phone: formData.phone,
                role_id: 3 // Vẫn giữ vai trò là Đại lý
            };
            await axiosClient.put(`/users/${id}`, userDataToUpdate);
            
            // ===================================
            // BƯỚC 2: CẬP NHẬT BẢNG member.agent (CHỈ gửi các trường CÓ trong DB)
            // ===================================
            const agentDataToUpdate = {
                // Gửi trường address (FE) tương ứng với diachi (DB)
                diachi: formData.address, 
                // KHÔNG GỬI paymentMethod, accountInfo, notes vì chúng không có trong DB
            };

            // Nếu không có gì để cập nhật cho Agent (ngoài address)
            if (Object.keys(agentDataToUpdate).length > 0) {
                // Gọi API Agent
                // id ở đây là user_id, được Controller BE sử dụng làm agentId
                await axiosClient.put(`/agent/updateAgent/${id}`, agentDataToUpdate);
            }
            
            setMessage('Cập nhật thông tin đại lý thành công!');
            setTimeout(() => navigate('/agent'), 1500);

        } catch (error) {
            console.error("Lỗi khi cập nhật đại lý:", error);
            // Hiển thị thông báo chi tiết hơn nếu có thể
            const detailedError = error.response?.data?.error || error.response?.data?.message || 'Có lỗi xảy ra (Lỗi Backend).';
            setMessage(detailedError);
        }
    };
    
    if (loading) {
        return <div className="text-center p-10">Đang tải...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Đại lý</h1>

            <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
                <h2 className="text-xl font-bold text-gray-700">Cập nhật thông tin đại lý</h2>
                <p className="text-sm text-gray-500 mt-1 mb-8">
                    Chỉnh sửa thông tin cho đại lý.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {/* Tên đại lý */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Tên đại lý</label>
                            <input type="text" name="username" id="username" value={formData.username} onChange={handleChange} placeholder="Nhập tên" className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" required />
                        </div>
                        {/* Địa chỉ */}
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                            <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} placeholder="Nhập địa chỉ" className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" />
                        </div>
                        {/* Số điện thoại */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                            <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} placeholder="Nhập số điện thoại" className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" required />
                        </div>
                        {/* Phương thức thanh toán */}
                        <div>
                            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">Phương thức thanh toán</label>
                            <select name="paymentMethod" id="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent">
                                <option value="">Chọn phương thức thanh toán</option>
                                <option value="bank">Chuyển khoản ngân hàng</option>
                                <option value="paypal">PayPal</option>
                                <option value="cash">Tiền mặt</option>
                            </select>
                        </div>
                        {/* Địa chỉ email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ email</label>
                            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} placeholder="Nhập địa chỉ email" className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" required />
                        </div>
                        {/* Thông tin tài khoản */}
                        <div>
                            <label htmlFor="accountInfo" className="block text-sm font-medium text-gray-700 mb-1">Nhập thông tin tài khoản</label>
                            <input type="text" name="accountInfo" id="accountInfo" value={formData.accountInfo} onChange={handleChange} placeholder="Số tài khoản, email PayPal" className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" />
                            <p className="text-xs text-gray-400 mt-1">Nhập thông tin tài khoản của bạn cho phương thức thanh toán đã chọn.</p>
                        </div>
                        {/* Ghi chú */}
                        <div className="md:col-span-2">
                             <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Ghi chú bổ sung (tùy chọn)</label>
                             <textarea name="notes" id="notes" rows="4" value={formData.notes} onChange={handleChange} placeholder="Thêm bất kỳ thông tin bổ sung nào" className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent"></textarea>
                        </div>
                    </div>

                    {message && <p className={`text-center mt-4 ${message.includes('thành công') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}

                    <div className="flex justify-end gap-4 mt-8">
                        <button 
                            type="button"
                            onClick={() => navigate('/npp/agents')} 
                            className="bg-red-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-600 transition-colors"
                        >
                            Hủy
                        </button>
                        <button 
                            type="submit"
                            className="bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 transition-colors"
                        >
                            Cập nhật
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateAgentPage;