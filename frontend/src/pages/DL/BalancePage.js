import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { LuSearch, LuPlus, LuEllipsisVertical } from 'react-icons/lu';
import { useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; 

// Dữ liệu mẫu (giữ nguyên)
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

// Component StatusBadge (Dịch text)
const StatusBadge = ({ status }) => {
    const { t } = useTranslation(); 
    const statusStyles = {
        success: { text: t('status.success'), color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' }, 
        failed: { text: t('status.failed'), color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' }, 
    };
    const style = statusStyles[status] || {};
    const textToShow = style.text || status || t('status.unknown'); 
    return <span className={`px-3 py-1 text-xs font-bold rounded-full ${style.color || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>{textToShow}</span>;
};


const BalancePage = () => {
    const { setPageTitle } = useOutletContext();
    const { t, i18n } = useTranslation();
    const [transactions] = useState(mockTransactions);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const totalPages = 10;
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        setPageTitle(t('sidebar.balance'));
    }, [setPageTitle, t, i18n.language]); 

    // Format tiền tệ dựa trên ngôn ngữ hiện tại
    const formatCurrency = (value) => {
        if (typeof value !== 'number') return value;
        return new Intl.NumberFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US', { style: 'currency', currency: 'VND' }).format(value);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    };

    const handleStatusFilterChange = (event) => {
        setStatusFilter(event.target.value);
        setCurrentPage(1);
    };

    const filteredTransactions = useMemo(() => {
        let result = transactions;
        if (searchTerm) {
            const lowercasedSearchTerm = searchTerm.toLowerCase();
            result = result.filter(transaction =>
                String(transaction.id).toLowerCase().includes(lowercasedSearchTerm)
            );
        }
        if (statusFilter) {
            result = result.filter(transaction => transaction.status === statusFilter);
        }
        return result;
    }, [transactions, searchTerm, statusFilter]);

     // Phân trang cho filteredTransactions
     const paginatedTransactions = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredTransactions.slice(startIndex, endIndex);
    }, [filteredTransactions, currentPage]);

    // Cập nhật Pagination (giữ nguyên logic)
    const renderPagination = () => {
         if (totalPages <= 1) return null;
         const pages = [];
         const maxPagesToShow = 5;
         let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
         let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
         if (endPage - startPage + 1 < maxPagesToShow) {
             startPage = Math.max(1, endPage - maxPagesToShow + 1);
         }
         const buttonClass = `px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 border dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600`;
         const activeButtonClass = `px-3 py-1 rounded-md bg-primary text-white`;

         if (startPage > 1) {
             pages.push(<button key={1} onClick={() => setCurrentPage(1)} className={buttonClass}>1</button>);
             if (startPage > 2) {
                 pages.push(<span key="dots-start" className="px-3 py-1 dark:text-gray-400">...</span>);
             }
         }
         for (let i = startPage; i <= endPage; i++) {
             pages.push(
                 <button
                     key={i}
                     onClick={() => setCurrentPage(i)}
                     className={`${currentPage === i ? activeButtonClass : buttonClass}`}
                 >
                     {i}
                 </button>
             );
         }
         if (endPage < totalPages) {
             if (endPage < totalPages - 1) {
                 pages.push(<span key="dots-end" className="px-3 py-1 dark:text-gray-400">...</span>);
             }
             pages.push(<button key={totalPages} onClick={() => setCurrentPage(totalPages)} className={buttonClass}>{totalPages}</button>);
         }
         return pages;
    };

    return (
        <div>
            {/* Thanh filter và thông tin số dư */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto flex-grow">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            placeholder={t('dl.balance.searchPlaceholder')}
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full md:w-80 bg-white border border-border-color rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={handleStatusFilterChange}
                        className="bg-white border border-border-color rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                        <option value="">{t('dl.balance.allStatuses')}</option>
                        <option value="success">{t('status.success')}</option>
                        <option value="failed">{t('status.failed')}</option>
                    </select>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                    <Link
                        to="/dl/balance/withdrawal"
                        className="flex items-center gap-2 bg-green-500 text-white font-bold px-4 py-2 rounded-lg hover:bg-green-600 transition-colors whitespace-nowrap"
                    >
                       <LuPlus size={20} />
                       {t('dl.balance.requestWithdrawal')}
                    </Link>
                    <div className="bg-red-100 p-3 rounded-lg text-center dark:bg-red-900">
                        <p className="text-sm text-red-700 dark:text-red-200">{t('dl.balance.unpaidBalance')}</p>
                        <p className="font-bold text-red-800 text-xl dark:text-red-100">{formatCurrency(2500000)}</p>
                    </div>
                     <div className="bg-blue-100 p-3 rounded-lg text-center dark:bg-blue-900">
                        <p className="text-sm text-blue-700 dark:text-blue-200">{t('dl.balance.yourBalance')}</p>
                        <p className="font-bold text-blue-800 text-xl dark:text-blue-100">{formatCurrency(5244000)}</p>
                    </div>
                </div>
            </div>
            {/* Bảng lịch sử */}
             <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-800 mb-4 dark:text-white">{t('dl.balance.transactionHistory')}</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t('dl.balance.invoiceCodeHeader')}</th>
                                <th scope="col" className="px-6 py-3">{t('dl.balance.transferAmountHeader')}</th>
                                <th scope="col" className="px-6 py-3">{t('dl.balance.remainingAmountHeader')}</th>
                                <th scope="col" className="px-6 py-3">{t('dl.balance.statusHeader')}</th>
                                <th scope="col" className="px-6 py-3">{t('dl.balance.reasonHeader')}</th>
                                <th scope="col" className="px-6 py-3">{t('dl.balance.transactionDateHeader')}</th>
                                <th scope="col" className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Sử dụng paginatedTransactions */}
                            {paginatedTransactions.map((item) => (
                                <tr key={item.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.id}</td>
                                    <td className="px-6 py-4 dark:text-gray-300">{formatCurrency(item.transferAmount)}</td>
                                    <td className="px-6 py-4 dark:text-gray-300">{formatCurrency(item.remainingAmount)}</td>
                                    <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
                                    <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">{item.reason}</td>
                                    {/* Format ngày theo ngôn ngữ */}
                                    <td className="px-6 py-4 dark:text-gray-300">{new Date(item.date).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')} <span className="text-gray-400 dark:text-gray-500">{item.time}</span></td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-4">
                                            {/* Sửa link cho DL */}
                                            <Link to={`/dl/balance/transaction/${item.id}`} state={{ transactionData: item }} className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-500">
                                                <LuEllipsisVertical size={18} />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                           
                        </tbody>
                    </table>
                </div>

                {/* Phân trang */}
                 <div className="flex justify-between items-center mt-6">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                         {t('general.showingResults', {
                             start: paginatedTransactions.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0,
                             end: (currentPage - 1) * ITEMS_PER_PAGE + paginatedTransactions.length,
                             total: filteredTransactions.length // Tổng số sau khi lọc
                         })}
                    </p>
                    {totalPages > 1 && (
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 border dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">{'<'}</button>
                            {renderPagination()}
                            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 border dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">{'>'}</button>
                        </div>
                    )}
                 </div>
            </div>
        </div>
    );
};

export default BalancePage;
