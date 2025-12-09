import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// ... (Component InfoField và formatCurrency giữ nguyên) ...
const InfoField = ({ label, value }) => (
    <div>
        <label className="block text-sm font-medium text-gray-500 mb-1">{label}</label>
        <div className="bg-gray-100 p-3 rounded-md text-gray-800 font-semibold">
            {value}
        </div>
    </div>
);

const formatCurrency = (value) => {
    if (typeof value !== 'number') return value;
    return new Intl.NumberFormat('vi-VN').format(value);
};


const PayCommissionPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const { commissionData } = location.state || { commissionData: {} };
    
    // Kiểm tra xem hoa hồng đã được thanh toán chưa
    const isPaid = commissionData.status === 'paid';

    if (!commissionData.id) {
        return (
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Không tìm thấy thông tin hoa hồng</h1>
                <button onClick={() => navigate('/commission')} className="text-blue-500">Quay lại danh sách</button>
            </div>
        )
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Hoa hồng</h1>

            <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
                <h2 className="text-xl font-bold text-gray-700 mb-6">
                    {isPaid ? 'Chi tiết hoa hồng đã thanh toán' : 'Thanh toán tiền hoa hồng'}
                </h2>

                {/* ... (phần grid các InfoField giữ nguyên) ... */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <InfoField label="Mã hoa hồng" value={commissionData.id} />
                    <InfoField label="Đại lý" value={commissionData.agent} />
                    <InfoField label="Số tiền chuyển (VND)" value={formatCurrency(commissionData.amount)} />
                    <InfoField label="Phương thức thanh toán" value="Chuyển khoản ngân hàng" />
                    <InfoField label="Số tài khoản" value="8888888888" />
                    <InfoField label="Ngày giao dịch" value={`${commissionData.date}   ${commissionData.time}`} />
                </div>
                <div className="col-span-2">
                     <InfoField label="Ghi chú bổ sung (tùy chọn)" value={`Thanh toán hoa hồng cho đại lý ${commissionData.agent}`} />
                </div>

                <div className="flex justify-end gap-4 mt-8">
                    <button 
                        onClick={() => navigate('/dl/commissions')} 
                        className="bg-gray-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        {isPaid ? 'Quay lại' : 'Đóng'}
                    </button>
                    {/* Vô hiệu hóa nút Thanh toán nếu đã thanh toán rồi */}
                    <button 
                        onClick={() => alert(`Thanh toán ${formatCurrency(commissionData.amount)} cho đại lý ${commissionData.agent}`)}
                        disabled={isPaid}
                        className={`font-bold py-2 px-6 rounded-lg transition-colors 
                                    ${isPaid 
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                        : 'bg-green-500 text-white hover:bg-green-600'
                                    }`}
                    >
                        {isPaid ? 'Đã Thanh Toán' : 'Thanh toán'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PayCommissionPage;