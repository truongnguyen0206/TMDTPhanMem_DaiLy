import { useState, useEffect, useMemo } from 'react';
import { LuSearch, LuDownload, LuFileText, LuPencil } from 'react-icons/lu';
import { useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import

// Dữ liệu mẫu (giữ nguyên)
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

// Component StatusBadge (Dịch text)
const StatusBadge = ({ status }) => {
    const { t } = useTranslation();
    const statusStyles = {
        standard: { text: t('npp.orders.agentSource'), color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
        priority: { text: t('npp.orders.ctvSource'), color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' }
    };
    const style = statusStyles[status] || {};
    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full flex items-center gap-2 ${style.color}`}>
            <span className={`w-2 h-2 rounded-full ${style.color.includes('blue') ? 'bg-blue-500' : 'bg-yellow-500'}`}></span>
            {style.text}
        </span>
    );
};


const OrdersPage = () => {
    const { setPageTitle } = useOutletContext();
    const { t, i18n } = useTranslation(); // Lấy t và i18n
    const [orders] = useState(mockOrders);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [sourceFilter, setSourceFilter] = useState('');
    const totalPages = 6;


    useEffect(() => {
        setPageTitle(t('npp.orders.title')); // Dịch tiêu đề
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setPageTitle, t, i18n.language]);

     const handleSearchChange = (e) => { setSearchTerm(e.target.value); setCurrentPage(1); };
     const handleFilterChange = (e) => { setSourceFilter(e.target.value); setCurrentPage(1); };
     const filteredOrders = useMemo(() => {
        let result = orders;
        if (searchTerm) {
            const lowercasedSearchTerm = searchTerm.toLowerCase();
            result = result.filter(order =>
                String(order.id).toLowerCase().includes(lowercasedSearchTerm) ||
                order.customer.toLowerCase().includes(lowercasedSearchTerm)
            );
        }
        if (sourceFilter) {
            result = result.filter(order => order.status === sourceFilter);
        }
        return result;
     }, [orders, searchTerm, sourceFilter]);

     const renderPagination = () => {
         if (totalPages <= 1) return null;
         const pages = [];
         const buttonClass = `px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 border dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600`;
         const activeButtonClass = `bg-primary text-white`;
         for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <button key={i} onClick={() => setCurrentPage(i)} className={`px-3 py-1 rounded-md ${currentPage === i ? activeButtonClass : buttonClass}`}>{i}</button>
            );
         }
        return pages;
    };


    return (
        <div>
            <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
                {/* Thanh Filter và Action */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative w-full md:w-auto">
                            <input
                                type="text"
                                placeholder={t('npp.orders.searchPlaceholder')}
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="w-full md:w-64 bg-light-gray border border-border-color rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                        </div>
                        <select
                            value={sourceFilter}
                            onChange={handleFilterChange}
                            className="bg-light-gray border border-border-color rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="">{t('npp.orders.allSources')}</option> {/* Dịch */}
                            <option value="standard">{t('npp.orders.agentSource')}</option> {/* Dịch */}
                            <option value="priority">{t('npp.orders.ctvSource')}</option> {/* Dịch */}
                        </select>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 bg-blue-100 text-blue-600 font-semibold px-4 py-2 rounded-lg hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800">
                           <LuDownload size={16} />
                           {t('npp.orders.downloadCSV')} {/* Dịch */}
                        </button>
                        <button className="flex items-center gap-2 bg-gray-100 text-gray-600 font-semibold px-4 py-2 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                           <LuFileText size={16} />
                           {t('npp.orders.downloadPDF')} {/* Dịch */}
                        </button>
                    </div>
                </div>

                {/* Bảng dữ liệu */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t('npp.orders.orderCodeHeader')}</th> {/* Dịch */}
                                <th scope="col" className="px-6 py-3">{t('npp.orders.valueHeader')}</th> {/* Dịch */}
                                <th scope="col" className="px-6 py-3">{t('npp.orders.commissionHeader')}</th> {/* Dịch */}
                                <th scope="col" className="px-6 py-3">{t('npp.orders.customerHeader')}</th> {/* Dịch */}
                                <th scope="col" className="px-6 py-3">{t('npp.orders.sourceHeader')}</th> {/* Dịch */}
                                <th scope="col" className="px-6 py-3">{t('npp.orders.createdDateHeader')}</th> {/* Dịch */}
                                <th scope="col" className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
                                    <tr key={order.id + '-' + order.billId} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{order.id}</td>
                                        <td className="px-6 py-4 dark:text-gray-300">{order.partnerId}</td>
                                        <td className="px-6 py-4 dark:text-gray-300">{order.billId}</td>
                                        <td className="px-6 py-4 dark:text-gray-300">{order.customer}</td>
                                        <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                                        <td className="px-6 py-4 dark:text-gray-300">{order.date} <span className="text-gray-400 dark:text-gray-500">{order.time}</span></td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-4">
                                                <button className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-500"><LuPencil size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-10 text-gray-500 dark:text-gray-400">
                                        {t('npp.orders.notFound')} {/* Dịch */}
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
                             start: filteredOrders.length > 0 ? (currentPage - 1) * 10 + 1 : 0, // Giả sử 10 item/trang
                             end: (currentPage - 1) * 10 + filteredOrders.length,
                             total: orders.length // Tổng số gốc
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

export default OrdersPage;