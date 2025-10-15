import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const WithdrawalRequestPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        amount: '',
        paymentMethod: '',
        accountInfo: '',
        notes: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Trong thực tế, bạn sẽ gọi API để gửi yêu cầu ở đây
        console.log('Dữ liệu yêu cầu rút tiền:', formData);
        alert('Đã gửi yêu cầu rút tiền thành công!');
        navigate('/dl/balance'); // Quay về trang số dư sau khi gửi
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Số dư</h1>

            <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
                <h2 className="text-xl font-bold text-gray-700">Biểu mẫu yêu cầu rút tiền</h2>
                <p className="text-sm text-gray-500 mt-1 mb-8">
                    Gửi yêu cầu rút tiền hoa hồng bạn đã kiếm được. Yêu cầu thường được xử lý trong vòng 3-5 ngày làm việc.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {/* Số tiền rút */}
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Số tiền rút (VND)</label>
                            <input type="number" name="amount" id="amount" value={formData.amount} onChange={handleChange} placeholder="Nhập số tiền" className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" required />
                            <p className="text-xs text-gray-400 mt-1">Khả dụng: 1.000.000VND | Tối thiểu: 100.000VND</p>
                        </div>

                        {/* Phương thức thanh toán */}
                        <div>
                            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">Phương thức thanh toán</label>
                            <select name="paymentMethod" id="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" required>
                                <option value="">Chọn phương thức thanh toán</option>
                                <option value="bank">Chuyển khoản ngân hàng</option>
                                <option value="paypal">PayPal</option>
                            </select>
                        </div>

                        {/* Thông tin tài khoản */}
                        <div className="md:col-span-2">
                            <label htmlFor="accountInfo" className="block text-sm font-medium text-gray-700 mb-1">Nhập thông tin tài khoản</label>
                            <input type="text" name="accountInfo" id="accountInfo" value={formData.accountInfo} onChange={handleChange} placeholder="Số tài khoản, email PayPal" className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" required />
                            <p className="text-xs text-gray-400 mt-1">Nhập thông tin tài khoản của bạn cho phương thức thanh toán đã chọn.</p>
                        </div>

                        {/* Ghi chú */}
                        <div className="md:col-span-2">
                             <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Ghi chú bổ sung (tùy chọn)</label>
                             <textarea name="notes" id="notes" rows="4" value={formData.notes} onChange={handleChange} placeholder="Thêm bất kỳ thông tin bổ sung nào" className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent"></textarea>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-8">
                        <button 
                            type="button"
                            onClick={() => navigate('/dl/balance')} 
                            className="bg-red-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-600 transition-colors"
                        >
                            Hủy
                        </button>
                        <button 
                            type="submit"
                            className="bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 transition-colors"
                        >
                            Gửi yêu cầu rút tiền
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WithdrawalRequestPage;