import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

// Dữ liệu mẫu
const mockHistory = [
    { id: 'AN-12345', amount: 5000000, content: 'Rút tiền tháng 10', date: '01/08/2025', status: 'pending', commission: 500000 },
    { id: 'AN-12346', amount: 2500000, content: 'Rút tiền tháng 9', date: '02/08/2025', status: 'approved', commission: 250000 },
    { id: 'AN-12347', amount: 3000000, content: 'Rút tiền tháng 8', date: '03/08/2025', status: 'approved', commission: 300000 },
    { id: 'AN-12348', amount: 1500000, content: 'Rút tiền tháng 7', date: '04/08/2025', status: 'rejected', commission: 150000 },
];

// Các component con để tái sử dụng
const StatCard = ({ title, value }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
);

const StatusBadge = ({ status }) => {
    const styles = {
        approved: { text: 'Khả dụng', color: 'bg-green-100 text-green-800' },
        rejected: { text: 'Không khả dụng', color: 'bg-red-100 text-red-800' },
        pending: { text: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800' },
    };
    const style = styles[status] || {};
    return <span className={`px-3 py-1 text-xs font-bold rounded-full ${style.color}`}>{style.text}</span>;
};

const CommissionPage = () => {
    const { setPageTitle } = useOutletContext();
    const [history, setHistory] = useState(mockHistory);

    useEffect(() => {
        setPageTitle('Yêu cầu rút hoa hồng');
    }, [setPageTitle]);

    const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

    return (
        <div className="space-y-6">
            {/* Các thẻ thông số ở trên */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Số dư khả dụng" value={formatCurrency(10000000)} />
                <StatCard title="Số tiền đang chờ xử lý" value={formatCurrency(100000)} />
                <StatCard title="Tổng tiền đã rút" value={formatCurrency(10000000)} />
                <StatCard title="Hạn mức còn lại tối thiểu" value={formatCurrency(5000000)} />
            </div>

            {/* Biểu mẫu yêu cầu rút tiền */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800">Biểu mẫu yêu cầu rút tiền</h3>
                <p className="text-sm text-gray-500 mt-1">Yêu cầu rút tiền hoa hồng của bạn sẽ được kiểm duyệt. Yêu cầu thường được xử lý trong vòng 3-5 ngày làm việc.</p>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Cột 1 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền rút (VND)</label>
                        <input type="text" placeholder="Nhập số tiền" className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary" />
                        <p className="text-xs text-gray-400 mt-1">Khả dụng: 10,000,000VND | Tối thiểu: 5,000,000VND</p>
                    </div>
                    {/* Cột 2 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức thanh toán</label>
                        <select className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary">
                            <option>Chọn phương thức thanh toán</option>
                            <option>Chuyển khoản ngân hàng</option>
                            <option>Paypal</option>
                        </select>
                    </div>
                    {/* Hàng ngang */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nhập thông tin tài khoản</label>
                        <input type="text" placeholder="Số tài khoản, email Paypal" className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú bổ sung (tùy chọn)</label>
                        <textarea rows="3" placeholder="Thêm bất kỳ thông tin bổ sung nào" className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary"></textarea>
                    </div>
                </div>
                <div className="flex justify-end mt-6">
                    <button className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                        Gửi yêu cầu rút tiền
                    </button>
                </div>
            </div>

            {/* Bảng lịch sử rút tiền */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Lịch sử yêu cầu rút tiền</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Mã yêu cầu</th>
                                <th className="px-6 py-3">Số tiền</th>
                                <th className="px-6 py-3">Nội dung</th>
                                <th className="px-6 py-3">Ngày tạo</th>
                                <th className="px-6 py-3">Trạng thái</th>
                                <th className="px-6 py-3">Hoa hồng</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map(item => (
                                <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{item.id}</td>
                                    <td className="px-6 py-4">{formatCurrency(item.amount)}</td>
                                    <td className="px-6 py-4">{item.content}</td>
                                    <td className="px-6 py-4">{item.date}</td>
                                    <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
                                    <td className="px-6 py-4 font-semibold">{formatCurrency(item.commission)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CommissionPage;