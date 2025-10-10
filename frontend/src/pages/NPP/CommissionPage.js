import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LuSearch, LuPencil, LuTrash2 } from 'react-icons/lu';
import { useOutletContext } from 'react-router-dom';

// ... (Dữ liệu mẫu và component StatusBadge giữ nguyên) ...
const mockCommissions = [
    { id: 58217, code: '58217342', status: 'pending', amount: 1500000, agent: 'DL001', source: 'Standard', date: '07/05/2025', time: '2:50PM' },
    { id: 58213, code: '58217343', status: 'paid', amount: 1200000, agent: 'DL002', source: 'Priority', date: '07/05/2025', time: '2:50PM' },
    { id: 58219, code: '58217344', status: 'paid', amount: 2000000, agent: 'DL003', source: 'Express', date: '07/05/2025', time: '2:50PM' },
    { id: 58220, code: '58217345', status: 'pending', amount: 1800000, agent: 'DL001', source: 'Standard', date: '07/05/2025', time: '2:50PM' },
    { id: 58223, code: '58217346', status: 'paid', amount: 2500000, agent: 'DL002', source: 'Express', date: '07/05/2025', time: '2:50PM' },
    { id: 58292, code: '58217348', status: 'paid', amount: 1500000, agent: 'DL004', source: 'Express', date: '07/05/2025', time: '2:50PM' },
    { id: 591782, code: '59217348', status: 'paid', amount: 1500000, agent: 'DL005', source: 'Express', date: '07/05/2025', time: '2:50PM' },
    { id: 583182, code: '58217347', status: 'pending', amount: 1500000, agent: 'DL002', source: 'Priority', date: '07/05/2025', time: '2:50PM' },
    { id: 592182, code: '59217347', status: 'paid', amount: 1500000, agent: 'DL002', source: 'Standard', date: '07/05/2025', time: '2:50PM' },
    { id: 587182, code: '58217347', status: 'pending', amount: 1500000, agent: 'DL001', source: 'Express', date: '07/05/2025', time: '2:50PM' },
];

const StatusBadge = ({ status }) => {
    const statusStyles = {
        paid: { text: 'Đã thanh toán', color: 'bg-green-100 text-green-800' },
        pending: { text: 'Chưa thanh toán', color: 'bg-red-100 text-yellow-800' },
    };
    const style = statusStyles[status] || {};
    return <span className={`px-3 py-1 text-xs font-bold rounded-full ${style.color}`}>{style.text}</span>;
};

const CommissionPage = () => {
    // ... (phần state, renderPagination, formatCurrency giữ nguyên) ...
    const [commissions, setCommissions] = useState(mockCommissions);
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 10;
    
    const renderPagination = () => {
        let pages = [];
        // Hiển thị logic phân trang đơn giản
        pages.push(<button key={1} onClick={() => setCurrentPage(1)} className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>1</button>);
        pages.push(<button key={2} onClick={() => setCurrentPage(2)} className={`px-3 py-1 rounded-md ${currentPage === 2 ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>2</button>);
        pages.push(<button key={3} onClick={() => setCurrentPage(3)} className={`px-3 py-1 rounded-md ${currentPage === 3 ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>3</button>);
        pages.push(<span key="dots" className="px-3 py-1">...</span>);
        pages.push(<button key={10} onClick={() => setCurrentPage(10)} className={`px-3 py-1 rounded-md ${currentPage === 10 ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>10</button>);
        return pages;
    };

    const formatCurrency = (value) => {
        if (typeof value !== 'number') return value;
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };
    const { setPageTitle } = useOutletContext();
    
        useEffect(() => {
            setPageTitle('Hoa hồng');
        }, [setPageTitle]);

    return (
        <div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                {/* ... (Thanh Filter giữ nguyên) ... */}
                 <div className="flex justify-between items-center mb-6">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Search by mã hoa hồng"
                            className="w-80 bg-light-gray border border-border-color rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        {/* ... (thead giữ nguyên) ... */}
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Mã Hoa Hồng</th>
                                <th scope="col" className="px-6 py-3">Phần Mềm</th>
                                <th scope="col" className="px-6 py-3">Trạng Thái</th>
                                <th scope="col" className="px-6 py-3">Hoa Hồng</th>
                                <th scope="col" className="px-6 py-3">Đại Lý</th>
                                <th scope="col" className="px-6 py-3">Nguồn Phát Sinh</th>
                                <th scope="col" className="px-6 py-3">Ngày Tạo</th>
                                <th scope="col" className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {commissions.map((item) => (
                                <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{item.id}</td>
                                    <td className="px-6 py-4">{item.code}</td>
                                    <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
                                    <td className="px-6 py-4 font-semibold text-gray-900">{formatCurrency(item.amount)}</td>
                                    <td className="px-6 py-4">{item.agent}</td>
                                    <td className="px-6 py-4">{item.source}</td>
                                    <td className="px-6 py-4">{item.date} <span className="text-gray-400">{item.time}</span></td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-4">
                                            {item.status === 'paid' ? (
                                                <button className="text-gray-300 cursor-not-allowed" disabled>
                                                    <LuPencil size={18} />
                                                </button>
                                            ) : (
                                                <Link to={`/commission/pay/${item.id}`} state={{ commissionData: item }} className="text-gray-400 hover:text-blue-600">
                                                    <LuPencil size={18} />
                                                </Link>
                                            )}
                                            
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {/* ... (Phân trang giữ nguyên) ... */}
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

export default CommissionPage;