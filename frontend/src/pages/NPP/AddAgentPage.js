import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

const AddAgentPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        paymentMethod: '',
        email: '',
        accountInfo: '',
        notes: ''
    });
    const [message, setMessage] = useState('');

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

        // TODO: Gửi dữ liệu đi. Hiện tại backend của bạn cần `password` và `role_id`.
        // Bạn cần quyết định cách tạo mật khẩu (tự động hoặc thêm trường nhập).
        // Tạm thời, chúng ta sẽ chỉ log dữ liệu ra console.

        console.log('Dữ liệu form:', formData);
        alert('Chức năng đang được phát triển. Dữ liệu đã được log ra console.');

        
        try {
            const response = await axiosClient.post('/users', {
                username: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: 'defaultPassword123', // Cần có cơ chế tạo mật khẩu
                role_id: 3 // Giả sử role_id của Đại lý là 3
            });
            setMessage('Tạo đại lý thành công!');
            setTimeout(() => navigate('/agents'), 2000);
        } catch (error) {
            console.error("Lỗi khi tạo đại lý:", error);
            setMessage(error.response?.data?.message || 'Có lỗi xảy ra.');
        }
        
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Đại lý</h1>

            <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
                <h2 className="text-xl font-bold text-gray-700">Biểu mẫu yêu cầu thêm đại lý</h2>
                <p className="text-sm text-gray-500 mt-1 mb-8">
                    Điền yêu cầu thêm đại lý. Yêu cầu thường được xử lý trong vòng 3-5 ngày làm việc.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {/* Tên đại lý */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Tên đại lý</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} placeholder="Nhập tên" className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" required />
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

                    {message && <p className="text-center text-green-600 mt-4">{message}</p>}

                    <div className="flex justify-end gap-4 mt-8">
                        <button 
                            type="button"
                            onClick={() => navigate('/agents')} 
                            className="bg-red-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-600 transition-colors"
                        >
                            Hủy
                        </button>
                        <button 
                            type="submit"
                            className="bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 transition-colors"
                        >
                            Gửi yêu cầu cấp tài khoản
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddAgentPage;