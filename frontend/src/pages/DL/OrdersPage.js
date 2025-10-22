import React, { useState, useEffect, useMemo } from 'react';

// --- Icons as SVG Components ---
// Thay thế import từ 'react-icons/lu' bằng các component SVG nội tuyến để giải quyết lỗi.

const SearchIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

const DownloadIcon = ({ size = 16 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
);

const FileTextIcon = ({ size = 16 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
);

const PencilIcon = ({ size = 18 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
    </svg>
);


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

const OrdersPage = () => {
    // Để component này có thể chạy độc lập, tôi sẽ tạm thời comment out useOutletContext
    // const { setPageTitle } = useOutletContext();
    
    // useEffect(() => {
    //     setPageTitle('Đơn hàng');
    // }, [setPageTitle]);

    const [orders, setOrders] = useState(mockOrders);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const totalPages = 6; // Giả sử có 6 trang

    // Hàm xử lý khi người dùng nhập vào ô tìm kiếm
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    // Lọc danh sách đơn hàng dựa trên searchTerm
    // useMemo giúp tối ưu hiệu suất, chỉ tính toán lại khi orders hoặc searchTerm thay đổi
    const filteredOrders = useMemo(() => {
        if (!searchTerm) {
            return orders; // Trả về tất cả đơn hàng nếu không có từ khóa tìm kiếm
        }
        return orders.filter(order =>
            String(order.id).toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [orders, searchTerm]);


    const renderPagination = () => {
        let pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`px-3 py-1 rounded-md ${currentPage === i ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                >
                    {i}
                </button>
            );
        }
        return pages;
    };

    return (
        <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
            <div className="bg-white p-6 rounded-lg shadow-md">
                {/* Thanh Filter và Action */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative w-full md:w-auto">
                            <input
                                type="text"
                                placeholder="Search by mã đơn"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="w-full md:w-64 bg-gray-50 border border-gray-300 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 bg-blue-100 text-blue-600 font-semibold px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors">
                           <DownloadIcon />
                           Download CSV
                        </button>
                        <button className="flex items-center gap-2 bg-gray-100 text-gray-600 font-semibold px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                           <FileTextIcon />
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
                                <th scope="col" className="px-6 py-3">Ngày Tạo</th>
                                <th scope="col" className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{order.id}</td>
                                    <td className="px-6 py-4">{order.partnerId}</td>
                                    <td className="px-6 py-4">{order.billId}</td>
                                    <td className="px-6 py-4">{order.customer}</td>
                                    <td className="px-6 py-4">{order.date} <span className="text-gray-400">{order.time}</span></td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-4">
                                            <button className="text-gray-400 hover:text-blue-600"><PencilIcon /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Phân trang */}
                <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
                    <p className="text-sm text-gray-500">Showing 1 to {filteredOrders.length} of {orders.length} results</p>
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 border">{'<'}</button>
                        {renderPagination()}
                        <button className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 border">{'>'}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrdersPage;

