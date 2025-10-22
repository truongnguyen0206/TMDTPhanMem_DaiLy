import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

// Component con để hiển thị các trường thông tin
const InfoField = ({ label, value }) => (
    <div>
        <label className="block text-sm font-medium text-gray-500 mb-1">{label}</label>
        <div className="bg-gray-100 p-3 rounded-md text-gray-800 font-semibold min-h-[44px] flex items-center">
            {value}
        </div>
    </div>
);

// Component con cho trạng thái
const StatusBadge = ({ status }) => {
    const statusStyles = {
        success: { text: 'Thành công', color: 'bg-green-100 text-green-800 border-green-200' },
        failed: { text: 'Thất bại', color: 'bg-red-100 text-red-800 border-red-200' },
    };
    const style = statusStyles[status] || {};
    return (
        <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Tình trạng</label>
            <div className={`px-4 py-3 text-sm font-bold rounded-md inline-block border ${style.color}`}>
                {style.text}
            </div>
        </div>
    );
};

// Hàm format số tiền
const formatCurrency = (value) => {
    if (typeof value !== 'number') return value;
    return new Intl.NumberFormat('vi-VN').format(value);
};

const TransactionDetailPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const { transactionData } = location.state || { transactionData: {} };

    if (!transactionData.id) {
        return (
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Không tìm thấy giao dịch</h1>
                <Link to="/dl/balance" className="text-blue-500 hover:underline">Quay lại danh sách</Link>
            </div>
        )
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Số dư</h1>

            <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
                <h2 className="text-xl font-bold text-gray-700 mb-6">Chi tiết giao dịch</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <InfoField label="Mã giao dịch" value={transactionData.id} />
                    <InfoField label="Số tiền chuyển (VND)" value={formatCurrency(transactionData.transferAmount)} />
                    
                    <InfoField label="Phương thức thanh toán" value="Chuyển khoản ngân hàng" />
                    <InfoField label="Số tài khoản" value="8888888888" />
                    <StatusBadge status={transactionData.status} />
                    
                    <InfoField label="Ngày giao dịch" value={`${transactionData.date}   ${transactionData.time}`} />
                    <div className="md:col-span-2">
                         <InfoField label="Ghi chú bổ sung (tùy chọn)" value={transactionData.reason || 'Thanh toán tiền hoa hồng'} />
                    </div>
                </div>
                
                <div className="flex justify-end gap-4 mt-8">
                    <button 
                        onClick={() => navigate('/dl/balance')} 
                        className="bg-red-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-600 transition-colors"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TransactionDetailPage;