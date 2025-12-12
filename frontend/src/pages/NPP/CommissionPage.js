import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { LuSearch, LuPencil } from 'react-icons/lu';
import { useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import

// Dữ liệu mẫu (giữ nguyên)
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

// Component StatusBadge (Dịch text)
const StatusBadge = ({ status }) => {
    const { t } = useTranslation();
    const statusStyles = {
        paid: { text: t('status.paid'), color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
        pending: { text: t('status.pendingPayment'), color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
    };
    const style = statusStyles[status] || {};
    return <span className={`px-3 py-1 text-xs font-bold rounded-full ${style.color}`}>{style.text}</span>;
};

const CommissionPage = () => {
    const { setPageTitle } = useOutletContext();
    const { t, i18n } = useTranslation(); // Lấy t và i18n
    const [commissions] = useState(mockCommissions);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const totalPages = 10;

    useEffect(() => {
        setPageTitle(t('npp.commissions.title')); // Dịch
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setPageTitle, t, i18n.language]);

     const handleSearchChange = (event) => { 
        setSearchTerm(event.target.value);
      };
     const handleStatusChange = (event) => { setStatusFilter(event.target.value); setCurrentPage(1); };
     const filteredCommissions = useMemo(() => {
        let result = commissions;
        if (searchTerm) {
            const lowercasedSearchTerm = searchTerm.toLowerCase();
            result = result.filter(item =>
                String(item.id).toLowerCase().includes(lowercasedSearchTerm) ||
                item.agent.toLowerCase().includes(lowercasedSearchTerm)
            );
        }
        if (statusFilter) {
            result = result.filter(item => item.status === statusFilter);
        }
        return result;
     }, [commissions, searchTerm, statusFilter]);

     const renderPagination = () => {
         if (totalPages <= 1) return null;
         const pages = [];
         const maxPagesToShow = 5;
         let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
         let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
         if (endPage - startPage + 1 < maxPagesToShow) {
             startPage = Math.max(1, endPage - maxPagesToShow + 1);
         }
         if (startPage > 1) {
             pages.push(<button key={1} onClick={() => setCurrentPage(1)} className={`px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 border dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600`}>1</button>);
             if (startPage > 2) {
                 pages.push(<span key="dots-start" className="px-3 py-1">...</span>);
             }
         }
         for (let i = startPage; i <= endPage; i++) {
             pages.push(
                 <button
                     key={i}
                     onClick={() => setCurrentPage(i)}
                     className={`px-3 py-1 rounded-md ${currentPage === i ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'}`}
                 >
                     {i}
                 </button>
             );
         }
         if (endPage < totalPages) {
             if (endPage < totalPages - 1) {
                 pages.push(<span key="dots-end" className="px-3 py-1">...</span>);
             }
             pages.push(<button key={totalPages} onClick={() => setCurrentPage(totalPages)} className={`px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 border dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600`}>{totalPages}</button>);
         }
         return pages;
    };

    const formatCurrency = (value) => {
        if (typeof value !== 'number') return value;
        return new Intl.NumberFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US', { style: 'currency', currency: 'VND' }).format(value); // Format tiền tệ theo ngôn ngữ
    };

    return (
        <div>
            <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
                 <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={t('npp.commissions.searchPlaceholder')} // Dịch
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="w-80 bg-light-gray border border-border-color rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={handleStatusChange}
                            className="bg-light-gray border border-border-color rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="">{t('npp.commissions.allStatuses')}</option> {/* Dịch */}
                            <option value="paid">{t('status.paid')}</option> {/* Dịch */}
                            <option value="pending">{t('status.pendingPayment')}</option> {/* Dịch */}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t('npp.commissions.commissionCodeHeader')}</th> {/* Dịch */}
                                <th scope="col" className="px-6 py-3">{t('npp.commissions.softwareHeader')}</th> {/* Dịch */}
                                <th scope="col" className="px-6 py-3">{t('npp.commissions.statusHeader')}</th> {/* Dịch */}
                                <th scope="col" className="px-6 py-3">{t('npp.commissions.commissionHeader')}</th> {/* Dịch */}
                                <th scope="col" className="px-6 py-3">{t('npp.commissions.agentHeader')}</th> {/* Dịch */}
                                <th scope="col" className="px-6 py-3">{t('npp.commissions.sourceHeader')}</th> {/* Dịch */}
                                <th scope="col" className="px-6 py-3">{t('npp.commissions.createdDateHeader')}</th> {/* Dịch */}
                                <th scope="col" className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCommissions.length > 0 ? (
                                filteredCommissions.map((item) => (
                                    <tr key={item.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.id}</td>
                                        <td className="px-6 py-4 dark:text-gray-300">{item.code}</td>
                                        <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
                                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{formatCurrency(item.amount)}</td>
                                        <td className="px-6 py-4 dark:text-gray-300">{item.agent}</td>
                                        <td className="px-6 py-4 dark:text-gray-300">{item.source}</td>
                                        <td className="px-6 py-4 dark:text-gray-300">{item.date} <span className="text-gray-400 dark:text-gray-500">{item.time}</span></td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-4">
                                                {item.status === 'paid' ? (
                                                    <button className="text-gray-300 cursor-not-allowed dark:text-gray-600" disabled> <LuPencil size={18} /> </button>
                                                ) : (
                                                    <Link to={`/npp/commissions/pay/${item.id}`} state={{ commissionData: item }} className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-500"> <LuPencil size={18} /> </Link>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center py-10 text-gray-500 dark:text-gray-400">
                                        {t('npp.commissions.notFound')} {/* Dịch */}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Phân trang */}
                <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                         {t('general.showingResults', {
                             start: filteredCommissions.length > 0 ? (currentPage - 1) * 10 + 1 : 0, // Giả sử 10 item/trang
                             end: (currentPage - 1) * 10 + filteredCommissions.length,
                             total: filteredCommissions.length
                         })} {/* Dịch */}
                    </p>
                    {totalPages > 1 && (
                        <div className="flex items-center gap-2">
                            <button className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 border dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">{'<'}</button>
                            {renderPagination()}
                            <button className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 border dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">{'>'}</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommissionPage;