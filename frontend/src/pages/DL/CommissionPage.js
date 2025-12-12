import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { LuSearch, LuPencil } from 'react-icons/lu';
import { useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import

// Dữ liệu mẫu
const mockCommissions = [
    { id: 58217, code: '58217342', status: 'pending', amount: 1500000, agent: 'CTV001', source: 'Standard', date: '07/05/2025', time: '2:50PM' },
    { id: 58213, code: '58217343', status: 'paid', amount: 1200000, agent: 'CTV002', source: 'Priority', date: '07/05/2025', time: '2:50PM' },
    { id: 58219, code: '58217344', status: 'paid', amount: 2000000, agent: 'CTV003', source: 'Express', date: '07/05/2025', time: '2:50PM' },
    { id: 58220, code: '58217345', status: 'pending', amount: 1800000, agent: 'CTV004', source: 'Standard', date: '07/05/2025', time: '2:50PM' },
    { id: 58223, code: '58217346', status: 'paid', amount: 2500000, agent: 'CTV005', source: 'Express', date: '07/05/2025', time: '2:50PM' },
    { id: 58292, code: '58217348', status: 'paid', amount: 1500000, agent: 'CTV006', source: 'Express', date: '07/05/2025', time: '2:50PM' },
    { id: 591782, code: '59217348', status: 'paid', amount: 1500000, agent: 'CTV007', source: 'Express', date: '07/05/2025', time: '2:50PM' },
    { id: 583182, code: '58217347', status: 'pending', amount: 1500000, agent: 'CTV008', source: 'Priority', date: '07/05/2025', time: '2:50PM' },
    { id: 592182, code: '59217347', status: 'paid', amount: 1500000, agent: 'CTV009', source: 'Standard', date: '07/05/2025', time: '2:50PM' },
    { id: 587182, code: '58217347', status: 'pending', amount: 1500000, agent: 'CTV010', source: 'Express', date: '07/05/2025', time: '2:50PM' },
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
    const totalPages = 3;

    useEffect(() => {
        setPageTitle(t('sidebar.commission')); // Dịch tiêu đề trang
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setPageTitle, t, i18n.language]);

     const handleSearchChange = (event) => { setSearchTerm(event.target.value); setCurrentPage(1); };

    const filteredCommissions = useMemo(() => {
        if (!searchTerm) return commissions;
        const lowerSearch = searchTerm.toLowerCase();
        return commissions.filter(item =>
            item.id.toString().includes(lowerSearch) ||
            item.agent.toLowerCase().includes(lowerSearch) // agent giờ là CTV
        );
    }, [commissions, searchTerm]);

    const renderPagination = () => {
        let pages = [];
        const buttonClass = `px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 border dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600`;
        const activeButtonClass = `bg-primary text-white`;

        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`px-3 py-1 rounded-md ${currentPage === i ? activeButtonClass : buttonClass}`}
                >
                    {i}
                </button>
            );
        }
        return pages;
    };

    const formatCurrency = (value) => {
        if (typeof value !== 'number') return value;
        return new Intl.NumberFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US', { style: 'currency', currency: 'VND' }).format(value);
    };

    return (
        <div>
            <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
                 <div className="flex justify-between items-center mb-6">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={t('dl.commissions.searchPlaceholder')}
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-80 bg-light-gray border border-border-color rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t('dl.commissions.commissionCodeHeader')}</th> 
                                <th scope="col" className="px-6 py-3">{t('dl.commissions.softwareHeader')}</th> 
                                <th scope="col" className="px-6 py-3">{t('dl.commissions.statusHeader')}</th> 
                                <th scope="col" className="px-6 py-3">{t('dl.commissions.commissionHeader')}</th> 
                                <th scope="col" className="px-6 py-3">{t('dl.commissions.ctvHeader')}</th> 
                                <th scope="col" className="px-6 py-3">{t('dl.commissions.sourceHeader')}</th> 
                                <th scope="col" className="px-6 py-3">{t('dl.commissions.createdDateHeader')}</th> 
                                <th scope="col" className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCommissions.map((item) => (
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
                                                <Link to={`/dl/commissions/pay/${item.id}`} state={{ commissionData: item }} className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-500"> <LuPencil size={18} /> </Link>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                             {filteredCommissions.length === 0 && (
                                <tr><td colSpan="8" className="text-center py-4 dark:text-gray-400">{t('dl.commissions.notFound')}</td></tr> // Dịch (cần thêm key mới)
                             )}
                        </tbody>
                    </table>
                </div>

                {/* Phân trang */}
                <div className="flex justify-between items-center mt-6">
                     <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('general.showingResults', {
                         start: filteredCommissions.length > 0 ? (currentPage - 1) * 10 + 1 : 0, // Giả sử 10 item/trang
                         end: (currentPage - 1) * 10 + filteredCommissions.length,
                         total: commissions.length
                     })} 
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