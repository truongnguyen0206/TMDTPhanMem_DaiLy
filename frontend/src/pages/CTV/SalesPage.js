import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

// Dữ liệu mẫu
const mockSalesData = [
    { id: 'AN-12345', user: 'Trường', email: 'user1@email.com', date: '01/08/2025', sales: 500000, status: 'pending', commission: 50000 },
    { id: 'AN-12346', user: 'Tuan', email: 'user2@email.com', date: '02/08/2025', sales: 1500000, status: 'active', commission: 150000 },
    { id: 'AN-12347', user: 'Ngan', email: 'user3@email.com', date: '03/08/2025', sales: 750000, status: 'active', commission: 75000 },
    { id: 'AN-12348', user: 'Tuan', email: 'user4@email.com', date: '04/08/2025', sales: 2000000, status: 'active', commission: 200000 },
    { id: 'AN-12349', user: 'Tuan', email: 'user5@email.com', date: '05/08/2025', sales: 0, status: 'inactive', commission: 0 },
    { id: 'AN-12350', user: 'Tuan', email: 'user6@email.com', date: '06/08/2025', sales: 0, status: 'inactive', commission: 0 },
];

// Component cho các thẻ thống kê nhỏ
const StatCard = ({ title, value }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1 dark:text-white">{value}</p>
    </div>
);

// Component cho trạng thái sản phẩm
const StatusBadge = ({ status }) => {
    const statusStyles = {
        active: { text: 'Xây dựng', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
        inactive: { text: 'Không khả dụng', color: 'bg-red-100 text-red-800 dark:bg-green-900 dark:text-green-200' },
    };
    const style = statusStyles[status] || {};
    return <span className={`px-3 py-1 text-xs font-bold rounded-full ${style.color}`}>{style.text}</span>;
};


const SalesPage = () => {
    const { setPageTitle } = useOutletContext();
    const [salesData, setSalesData] = useState(mockSalesData);
    const [currentPage, setCurrentPage] = useState(1);
    
    useEffect(() => {
        setPageTitle('Doanh số & mã giới thiệu');
    }, [setPageTitle]);

    const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

    const renderPagination = () => {
        // Logic phân trang đơn giản
        return [1, 2, 3].map(i => 
            <button key={i} onClick={() => setCurrentPage(i)} className={`px-3 py-1 rounded-md ${currentPage === i ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border'}`}>{i}</button>
        );
    };

    return (
        <div className="space-y-6">
            {/* Thẻ thống kê */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <StatCard title="Tổng doanh số" value="15" />
                 <StatCard title="Mã đang hoạt động" value="8" />
                 <StatCard title="Tổng Doanh thu" value={formatCurrency(10000000)} />
                 <StatCard title="Tổng Hoa Hồng" value={formatCurrency(5000000)} />
            </div>

            {/* Bảng dữ liệu */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600 dark:text-gray-400 ">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-3">Mã giới thiệu</th>
                                <th className="px-6 py-3">Tên User</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Ngày tạo</th>
                                <th className="px-6 py-3">Doanh số</th>
                                <th className="px-6 py-3">Trạng thái</th>
                                <th className="px-6 py-3">Hoa hồng</th>
                            </tr>
                        </thead>
                        <tbody>
                            {salesData.map(item => (
                                <tr key={item.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.id}</td>
                                    <td className="px-6 py-4">{item.user}</td>
                                    <td className="px-6 py-4">{item.email}</td>
                                    <td className="px-6 py-4">{item.date}</td>
                                    <td className="px-6 py-4">{formatCurrency(item.sales)}</td>
                                    <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
                                    <td className="px-6 py-4 font-semibold dark:text-white">{formatCurrency(item.commission)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                 {/* Phân trang */}
                <div className="flex justify-between items-center mt-6">
                    <p className="text-sm text-gray-500">Showing 1 to 6 of 6 results</p>
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 border">{'<'}</button>
                        {renderPagination()}
                        <span className="px-3 py-1">...</span>
                        <button className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 border">10</button>
                        <button className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 border">{'>'}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesPage;