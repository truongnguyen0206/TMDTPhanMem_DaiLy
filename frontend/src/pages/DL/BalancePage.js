import React, { useState,useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { LuSearch, LuPencil, LuTrash2, LuPlus, LuEllipsisVertical  } from 'react-icons/lu';
import { useOutletContext } from 'react-router-dom';

// ... (Dữ liệu mẫu và các component con giữ nguyên) ...
const mockTransactions = [
    { id: 58217, transferAmount: 1000000, remainingAmount: 2344000, status: 'success', reason: '', date: '07/05/2025', time: '2:53PM' },
    { id: 58213, transferAmount: 1200000, remainingAmount: 200000, status: 'success', reason: '', date: '07/05/2025', time: '2:53PM' },
    { id: 58219, transferAmount: 1200000, remainingAmount: 950000, status: 'success', reason: '', date: '07/05/2025', time: '2:53PM' },
    { id: 58220, transferAmount: 10000000, remainingAmount: 1440000, status: 'failed', reason: 'Số dư không đủ', date: '07/05/2025', time: '2:53PM' },
    { id: 58223, transferAmount: 500000, remainingAmount: 1000000, status: 'failed', reason: 'Giao dịch phát sinh từ 1.500.000đ trở lên', date: '07/05/2025', time: '2:53PM' },
    { id: 58292, transferAmount: 10500000, remainingAmount: 1000000, status: 'success', reason: '', date: '07/05/2025', time: '2:53PM' },
    { id: 591782, transferAmount: 2300000, remainingAmount: 1000000, status: 'success', reason: '', date: '07/05/2025', time: '2:53PM' },
    { id: 583182, transferAmount: 2500000, remainingAmount: 1000000, status: 'success', reason: '', date: '07/05/2025', time: '2:53PM' },
    { id: 592182, transferAmount: 1500000, remainingAmount: 1000000, status: 'success', reason: '', date: '07/05/2025', time: '2:53PM' },
    { id: 587182, transferAmount: 5000000, remainingAmount: 1000000, status: 'success', reason: '', date: '07/05/2025', time: '2:53PM' },
];

const StatusBadge = ({ status }) => {
    const statusStyles = {
        success: { text: 'Thành công', color: 'bg-green-100 text-green-800' },
        failed: { text: 'Thất bại', color: 'bg-red-100 text-red-800' },
    };
    const style = statusStyles[status] || {};
    return <span className={`px-3 py-1 text-xs font-bold rounded-full ${style.color}`}>{style.text}</span>;
};

// Hàm format số tiền
const formatCurrency = (value) => {
    if (typeof value !== 'number') return value;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const BalancePage = () => {
    // ... (phần state và renderPagination giữ nguyên) ...
     const [transactions, setTransactions] = useState(mockTransactions);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const totalPages = 10;

    const renderPagination = () => {
        let pages = [];
        pages.push(<button key={1} onClick={() => setCurrentPage(1)} className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>1</button>);
        pages.push(<button key={2} onClick={() => setCurrentPage(2)} className={`px-3 py-1 rounded-md ${currentPage === 2 ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>2</button>);
        pages.push(<button key={3} onClick={() => setCurrentPage(3)} className={`px-3 py-1 rounded-md ${currentPage === 3 ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>3</button>);
        pages.push(<span key="dots" className="px-3 py-1">...</span>);
        pages.push(<button key={10} onClick={() => setCurrentPage(10)} className={`px-3 py-1 rounded-md ${currentPage === 10 ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>10</button>);
        return pages;
    };
    const { setPageTitle } = useOutletContext();
        
    useEffect(() => {
        setPageTitle('Số dư');
    }, [setPageTitle]);
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    };

    const filteredTransactions = useMemo(() => {
        if (!searchTerm) return transactions;
        return transactions.filter(item =>
            item.id.toString().includes(searchTerm)
        );
    }, [transactions, searchTerm]);
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6 gap-4">
                <div className="relative flex-grow">
                    <input 
                        type="text" 
                        placeholder="Search by mã hóa đơn"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full bg-white border border-border-color rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <div className="flex items-center gap-4">
                    {/* THAY THẾ <button> bằng <Link> */}
                    <Link 
                        to="/dl/withdrawal"
                        className="flex items-center gap-2 bg-green-500 text-white font-bold px-4 py-2 rounded-lg hover:bg-green-600 transition-colors whitespace-nowrap"
                    >
                       <LuPlus size={20} />
                       Yêu cầu rút tiền
                    </Link>
                    <div className="bg-red-100 p-3 rounded-lg text-center">
                        <p className="text-sm text-red-700">Số dư chưa thanh toán</p>
                        <p className="font-bold text-red-800 text-xl">{formatCurrency(2500000)}</p>
                    </div>
                     <div className="bg-blue-100 p-3 rounded-lg text-center">
                        <p className="text-sm text-blue-700">Số dư của bạn</p>
                        <p className="font-bold text-blue-800 text-xl">{formatCurrency(5244000)}</p>
                    </div>
                </div>
            </div>
            {/* ... (Phần còn lại của component giữ nguyên) ... */}
             <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Lịch sử giao dịch</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Mã Hóa Đơn</th>
                                <th scope="col" className="px-6 py-3">Số Tiền Chuyển</th>
                                <th scope="col" className="px-6 py-3">Số Tiền Còn Lại</th>
                                <th scope="col" className="px-6 py-3">Tình Trạng</th>
                                <th scope="col" className="px-6 py-3">Lý Do</th>
                                <th scope="col" className="px-6 py-3">Ngày Giao Dịch</th>
                                <th scope="col" className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map((item) => (
                                <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{item.id}</td>
                                    <td className="px-6 py-4">{formatCurrency(item.transferAmount)}</td>
                                    <td className="px-6 py-4">{formatCurrency(item.remainingAmount)}</td>
                                    <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
                                    <td className="px-6 py-4 text-xs text-gray-500">{item.reason}</td>
                                    <td className="px-6 py-4">{item.date} <span className="text-gray-400">{item.time}</span></td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-4">
                                            <Link to={`/dl/balance/transaction/${item.id}`} state={{ transactionData: item }} className="text-gray-400 hover:text-blue-600">
                                                <LuEllipsisVertical size={18} />
                                            </Link>
                                            
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <div className="flex justify-between items-center mt-6">
                    <p className="text-sm text-gray-500">Showing 1 to 10 of 97 results</p>
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

export default BalancePage;