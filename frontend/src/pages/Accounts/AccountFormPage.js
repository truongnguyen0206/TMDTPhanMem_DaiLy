import { useState, useEffect } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

// Thêm prop "mode" để phân biệt 'add' và 'edit'
const AccountFormPage = ({ mode }) => {
    const navigate = useNavigate();
    const { id } = useParams(); // Sẽ có giá trị khi ở mode 'edit'
    const { setPageTitle } = useOutletContext();
    
    const isEditMode = mode === 'edit';

    const [formData, setFormData] = useState({
        username: '',
        address: '',
        phone: '',
        paymentMethod: '',
        email: '',
        accountInfo: '',
        notes: ''
    });
    const [loading, setLoading] = useState(isEditMode); // Chỉ loading khi ở chế độ edit
    const [message, setMessage] = useState('');

    useEffect(() => {
        setPageTitle(isEditMode ? 'Cập Nhật Đại Lý' : 'Thêm Đại Lý');
        
        if (isEditMode) {
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
        }
    }, [id, isEditMode, setPageTitle]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        const payload = {
            username: formData.username,
            email: formData.email,
            phone: formData.phone,
            role_id: 2, // Giả sử role_id của Đại lý là 2
            // Thêm mật khẩu nếu là form thêm mới
            ...( !isEditMode && { password: 'defaultPassword123' } )
        };

        try {
            if (isEditMode) {
                await axiosClient.put(`/users/${id}`, payload);
                setMessage('Cập nhật thông tin đại lý thành công!');
            } else {
                await axiosClient.post('/users', payload);
                setMessage('Tạo đại lý thành công!');
            }
            setTimeout(() => navigate('/agents'), 1500);
        } catch (error) {
            console.error(`Lỗi khi ${isEditMode ? 'cập nhật' : 'tạo'} đại lý:`, error);
            setMessage(error.response?.data?.message || 'Có lỗi xảy ra.');
        }
    };
    
    if (loading) {
        return <div className="text-center p-10">Đang tải...</div>;
    }

    return (
        <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-gray-700">{isEditMode ? 'Cập nhật thông tin đại lý' : 'Biểu mẫu yêu cầu thêm đại lý'}</h2>
            <p className="text-sm text-gray-500 mt-1 mb-8">
                {isEditMode ? 'Chỉnh sửa thông tin cho đại lý.' : 'Điền yêu cầu thêm đại lý. Yêu cầu thường được xử lý trong vòng 3-5 ngày làm việc.'}
            </p>

            <form onSubmit={handleSubmit}>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Các trường input giữ nguyên */}
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Tên đại lý</label>
                        <input type="text" name="username" id="username" value={formData.username} onChange={handleChange} placeholder="Nhập tên" className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" required />
                    </div>
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                        <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} placeholder="Nhập địa chỉ" className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                        <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} placeholder="Nhập số điện thoại" className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" required />
                    </div>
                    <div>
                        <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">Phương thức thanh toán</label>
                        <select name="paymentMethod" id="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent">
                            <option value="">Chọn phương thức thanh toán</option>
                            <option value="bank">Chuyển khoản ngân hàng</option>
                            <option value="paypal">PayPal</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ email</label>
                        <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} placeholder="Nhập địa chỉ email" className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" required />
                    </div>
                    <div>
                        <label htmlFor="accountInfo" className="block text-sm font-medium text-gray-700 mb-1">Nhập thông tin tài khoản</label>
                        <input type="text" name="accountInfo" id="accountInfo" value={formData.accountInfo} onChange={handleChange} placeholder="Số tài khoản, email PayPal" className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" />
                        <p className="text-xs text-gray-400 mt-1">Nhập thông tin tài khoản của bạn cho phương thức thanh toán đã chọn.</p>
                    </div>
                    <div className="md:col-span-2">
                         <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Ghi chú bổ sung (tùy chọn)</label>
                         <textarea name="notes" id="notes" rows="4" value={formData.notes} onChange={handleChange} placeholder="Thêm bất kỳ thông tin bổ sung nào" className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent"></textarea>
                    </div>
                </div>

                {message && <p className={`text-center mt-4 ${message.includes('thành công') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}

                <div className="flex justify-end gap-4 mt-8">
                    <button type="button" onClick={() => navigate('/agents')} className="bg-red-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-600 transition-colors">Hủy</button>
                    <button type="submit" className="bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 transition-colors">
                        {isEditMode ? 'Cập nhật' : 'Gửi yêu cầu'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AccountFormPage;