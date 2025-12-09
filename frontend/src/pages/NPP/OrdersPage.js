import React, { useState, useEffect, useMemo } from 'react';
import { LuSearch, LuDownload, LuFileText, LuPencil, LuTrash2 } from 'react-icons/lu';
import { useOutletContext } from 'react-router-dom';

// Dữ liệu mẫu
const mockOrders = [
    { id: 58217, partnerId: '789012342', billId: 1, customer: 'Zody Phish', date: '07/05/2020', time: '2:50PM', status: 'standard' },
    { id: 58213, partnerId: '789012343', billId: 2, customer: 'Krisop Pocus', date: '07/05/2020', time: '2:50PM', status: 'priority' },
    { id: 58123, partnerId: '789012344', billId: 12, customer: 'Darian Howard', date: '07/05/2020', time: '2:50PM', status: 'priority' },
    { id: 58120, partnerId: '789012345', billId: 22, customer: 'Jenny Wilson', date: '07/05/2020', time: '2:50PM', status: 'priority' },
    { id: 58122, partnerId: '789012346', billId: 32, customer: 'John Bezin', date: '07/05/2020', time: '2:50PM', status: 'priority' },
    { id: 58292, partnerId: '789012348', billId: 40, customer: 'Camyron Williamson', date: '07/05/2020', time: '2:50PM', status: 'priority' },
    { id: 181337, partnerId: '789012349', billId: 41, customer: 'Camyron Williamson', date: '07/05/2020', time: '2:50PM', status: 'priority' },
    { id: 58293, partnerId: '789012347', billId: 45, customer: 'Dody Phish', date: '07/05/2020', time: '2:50PM', status: 'priority' },
    { id: 789787, partnerId: '789012347', billId: 49, customer: 'John Bezin', date: '07/05/2020', time: '2:50PM', status: 'standard' },
    { id: 58294, partnerId: '789012327', billId: 68, customer: 'Camyron Williamson', date: '07/05/2020', time: '2:50PM', status: 'priority' },
];

const StatusBadge = ({ status }) => {
    const statusStyles = {
        standard: { text: 'Đại lý', color: 'bg-blue-100 text-blue-800' },
        priority: { text: 'Cộng tác viên', color: 'bg-yellow-100 text-yellow-800' }
    };

    const style = statusStyles[status] || {};

    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full flex items-center gap-2 ${style.color}`}>
            <span className={`w-2 h-2 rounded-full ${style.color.replace('100', '500').replace('text-yellow-800', 'bg-yellow-500')}`}></span>
            {style.text}
        </span>
    );
};

const OrdersPage = () => {
    const [orders, setOrders] = useState(mockOrders);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [sourceFilter, setSourceFilter] = useState(''); // State for the source filter
    const totalPages = 6; // Giả sử có 6 trang
    const { setPageTitle } = useOutletContext();

    useEffect(() => {
        setPageTitle('Đơn hàng');
    }, [setPageTitle]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterChange = (e) => {
        setSourceFilter(e.target.value);
    };

    const filteredOrders = useMemo(() => {
        let result = orders;

        // Filtering by search term (Mã đơn or Tên khách hàng)
        if (searchTerm) {
            const lowercasedSearchTerm = searchTerm.toLowerCase();
            result = result.filter(order =>
                String(order.id).toLowerCase().includes(lowercasedSearchTerm) ||
                order.customer.toLowerCase().includes(lowercasedSearchTerm)
            );
        }

        // Filtering by source (Nguồn phát sinh)
        if (sourceFilter) {
            result = result.filter(order => order.status === sourceFilter);
        }

        return result;
    }, [orders, searchTerm, sourceFilter]);


    const renderPagination = () => {
        let pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <button 
                    key={i} 
                    onClick={() => setCurrentPage(i)}
                    className={`px-3 py-1 rounded-md ${currentPage === i ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                >
                    {i}
                </button>
            );
        }
        return pages;
    };

    return (
        <div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                {/* Thanh Filter và Action */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Tìm theo Mã đơn hoặc Khách hàng"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="w-64 bg-light-gray border border-border-color rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                        <select 
                            value={sourceFilter}
                            onChange={handleFilterChange}
                            className="bg-light-gray border border-border-color rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="">Tất cả nguồn</option>
                            <option value="standard">Đại lý</option>
                            <option value="priority">Cộng tác viên</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 bg-blue-100 text-blue-600 font-semibold px-4 py-2 rounded-lg hover:bg-blue-200">
                           <LuDownload size={16} />
                           Download CSV
                        </button>
                        <button className="flex items-center gap-2 bg-gray-100 text-gray-600 font-semibold px-4 py-2 rounded-lg hover:bg-gray-200">
                           <LuFileText size={16} />
                           Download PDF
                        </button>
                    </div>
                </div>

                {/* Bảng dữ liệu */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Mã Đơn</th>
                                <th scope="col" className="px-6 py-3">Giá Trị</th>
                                <th scope="col" className="px-6 py-3">Hoa Hồng</th>
                                <th scope="col" className="px-6 py-3">Khách Hàng</th>
                                <th scope="col" className="px-6 py-3">Nguồn Phát Sinh</th>
                                <th scope="col" className="px-6 py-3">Ngày Tạo</th>
                                <th scope="col" className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
                                    <tr key={order.id + '-' + order.billId} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{order.id}</td>
                                        <td className="px-6 py-4">{order.partnerId}</td>
                                        <td className="px-6 py-4">{order.billId}</td>
                                        <td className="px-6 py-4">{order.customer}</td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={order.status} />
                                        </td>
                                        <td className="px-6 py-4">{order.date} <span className="text-gray-400">{order.time}</span></td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-4">
                                                <button className="text-gray-400 hover:text-blue-600"><LuPencil size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-10 text-gray-500">
                                        Không tìm thấy đơn hàng nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Phân trang */}
                <div className="flex justify-between items-center mt-6">
                    <p className="text-sm text-gray-500">Showing 1 to {filteredOrders.length} of {orders.length} results</p>
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100">{'<'}</button>
                        {renderPagination()}
                        <button className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100">{'>'}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrdersPage;
