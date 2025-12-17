import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axiosClient from '../../api/axiosClient'; // Import client API
import { useAuth } from '../../context/AuthContext';

// Các component con (Giữ nguyên style cũ)
const StatCard = ({ title, value }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
);

const StatusBadge = ({ status }) => {
    const styles = {
        Approved: { text: 'Đã duyệt', color: 'bg-green-100 text-green-800' },
        Rejected: { text: 'Từ chối', color: 'bg-red-100 text-red-800' },
        Pending: { text: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800' },
    };
    const style = styles[status] || { text: status, color: 'bg-gray-100' };
    return <span className={`px-3 py-1 text-xs font-bold rounded-full ${style.color}`}>{style.text}</span>;
};

const CommissionPage = () => {
    const { setPageTitle } = useOutletContext();
    const { user } = useAuth();

    // State dữ liệu
    const [balanceInfo, setBalanceInfo] = useState({
        sodu_khadung: 0,
        tong_hoahong: 0,
        tong_ruttien: 0
    });
    
    // State form rút tiền
    const [formData, setFormData] = useState({
        amount: '',
        method: 'Chuyển khoản ngân hàng', // Default
        accountInfo: '',
        note: ''
    });

    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);

    // Format tiền tệ
    const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

    useEffect(() => {
        setPageTitle('Quản lý Hoa hồng & Rút tiền');
        fetchData();
    }, [setPageTitle]);

    // 1. Lấy thông tin số dư (Tái sử dụng API Dashboard Personal)
    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.get('/api/dashboard/personal');
            if (res.data.success) {
                setBalanceInfo(res.data.data.financial || {});
            }
        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
        } finally {
            setLoading(false);
        }
    };

    // 2. Xử lý nhập liệu form
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 3. Gửi yêu cầu rút tiền
    const handleSubmit = async () => {
        // Validate cơ bản
        if (!formData.amount || Number(formData.amount) < 1000000) {
            return alert("Số tiền rút tối thiểu là 1.000.000 VNĐ");
        }
        if (Number(formData.amount) > balanceInfo.sodu_khadung) {
            return alert("Số dư không đủ!");
        }
        if (!formData.accountInfo) {
            return alert("Vui lòng nhập thông tin tài khoản nhận tiền.");
        }

        try {
            setSubmitLoading(true);
            
            // Gọi API Backend
            const res = await axiosClient.post('/api/withdrawal', {
                amount: Number(formData.amount),
                // Các trường note/method hiện tại BE chưa lưu, nhưng cứ gửi để mở rộng sau
                note: `${formData.method} - ${formData.accountInfo} - ${formData.note}` 
            });

            if (res.status === 201 || res.data.success) {
                alert("✅ Gửi yêu cầu thành công! Vui lòng chờ Admin duyệt.");
                // Reset form và load lại số dư
                setFormData({ amount: '', method: 'Chuyển khoản ngân hàng', accountInfo: '', note: '' });
                fetchData(); 
            }
        } catch (error) {
            console.error("Lỗi rút tiền:", error);
            const msg = error.response?.data?.details || error.response?.data?.error || "Gửi yêu cầu thất bại.";
            alert(`❌ Lỗi: ${msg}`);
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Hàng 1: Thẻ thông số (Dữ liệu thật) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Số dư khả dụng" value={formatCurrency(balanceInfo.sodu_khadung)} />
                {/* Các thẻ dưới đây tạm thời lấy từ balanceInfo hoặc mock nếu chưa có API riêng */}
                <StatCard title="Tổng hoa hồng kiếm được" value={formatCurrency(balanceInfo.tong_hoahong)} />
                <StatCard title="Tổng tiền đã rút" value={formatCurrency(balanceInfo.tong_ruttien)} />
                <StatCard title="Hạn mức rút tối thiểu" value={formatCurrency(1000000)} />
            </div>

            {/* Hàng 2: Form rút tiền */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800">Tạo yêu cầu rút tiền</h3>
                <p className="text-sm text-gray-500 mt-1">
                    Số dư khả dụng: <span className="font-bold text-green-600">{formatCurrency(balanceInfo.sodu_khadung)}</span>. 
                    Thời gian xử lý: 3-5 ngày làm việc.
                </p>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Số tiền */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền muốn rút (VNĐ)</label>
                        <input 
                            type="number" 
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            placeholder="Nhập số tiền (VD: 1000000)" 
                            className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                        <p className="text-xs text-gray-400 mt-1">Tối thiểu: 1.000.000 ₫</p>
                    </div>

                    {/* Phương thức */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức nhận tiền</label>
                        <select 
                            name="method"
                            value={formData.method}
                            onChange={handleChange}
                            className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="Chuyển khoản ngân hàng">Chuyển khoản ngân hàng</option>
                        </select>
                    </div>

                    {/* Thông tin TK */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Thông tin tài khoản nhận</label>
                        <input 
                            type="text" 
                            name="accountInfo"
                            value={formData.accountInfo}
                            onChange={handleChange}
                            placeholder="VD: Vietcombank - 0123456789 - NGUYEN VAN A" 
                            className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                    </div>

                    {/* Ghi chú */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú thêm</label>
                        <textarea 
                            rows="3" 
                            name="note"
                            value={formData.note}
                            onChange={handleChange}
                            placeholder="Nội dung chuyển khoản mong muốn..." 
                            className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        ></textarea>
                    </div>
                </div>

                <div className="flex justify-end mt-6">
                    <button 
                        onClick={handleSubmit}
                        disabled={submitLoading}
                        className={`font-bold py-2 px-6 rounded-lg transition-colors text-white 
                            ${submitLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {submitLoading ? 'Đang gửi...' : 'Gửi yêu cầu rút tiền'}
                    </button>
                </div>
            </div>

            {/* Hàng 3: Lịch sử rút tiền (Tạm thời Mock vì BE chưa có API getHistory riêng cho user) */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Lịch sử rút tiền gần đây</h3>
                <div className="text-center py-8 text-gray-500 italic border-t border-gray-100">
                    (Tính năng hiển thị lịch sử chi tiết đang được cập nhật...)
                </div>
            </div>
        </div>
    );
};

export default CommissionPage;