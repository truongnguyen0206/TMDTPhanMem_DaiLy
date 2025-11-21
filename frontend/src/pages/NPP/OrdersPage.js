import { useState, useEffect, useMemo } from 'react';
import { LuSearch, LuDownload, LuEye, LuPencil } from 'react-icons/lu';
import { useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

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

const StatusBadge = ({ status }) => {
    const { t } = useTranslation();
    const getStatusStyle = (s) => {
        if (!s) return { text: t('status.unknown'), color: 'bg-gray-100 text-gray-800' };
        const lowerS = String(s).toLowerCase();
        if (['paid', 'completed', 'thành công', 'đã hoàn thành', 'đã thanh toán'].some(k => lowerS.includes(k))) {
            return { text: s, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
        }
        if (['pending', 'chờ', 'chưa thanh toán', 'đang xử lý'].some(k => lowerS.includes(k))) {
            return { text: s, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' };
        }
        if (['cancelled', 'đã hủy', 'failed'].some(k => lowerS.includes(k))) {
            return { text: s, color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' };
        }
        return { text: s, color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' };
    };
    const style = getStatusStyle(status);
    return (
        <span className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${style.color}`}>
            {style.text}
        </span>
    );
};
const RoleBadge = ({ role }) => {
    let colorClass = 'bg-gray-100 text-gray-800';
    const lowerRole = String(role || '').toLowerCase();

    if (lowerRole.includes('đại lý') || lowerRole.includes('agent')) {
        colorClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    } else if (lowerRole.includes('cộng tác viên') || lowerRole.includes('ctv')) {
        colorClass = 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    } else if (lowerRole.includes('khách') || lowerRole.includes('customer')) {
        colorClass = 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    }

    return (
        <span className={`px-2 py-1 rounded text-xs font-medium ${colorClass}`}>
            {role || 'Không rõ'}
        </span>
    );
};
const OrdersPage = () => {
    const { setPageTitle } = useOutletContext();
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const itemsPerPage = 10;

    useEffect(() => {
        setPageTitle(t('npp.orders.title'));

        const fetchDistributorOrders = async () => {
            if (!user || !user.id) return;
            setLoading(true);
            
            try {
                let nppId = null;
                const response = await axiosClient.get('/npp'); 
                const currentUserInfo = response.data.find(u => u.user_id === user.id);

                if (currentUserInfo && currentUserInfo.npp_id) {
                    nppId = currentUserInfo.npp_id;
                    console.log("Tìm thấy NPP ID:", nppId);
                }
                if (nppId) {
                     const ordersRes = await axiosClient.get(`/npp/tong_orders/${nppId}`);
                     setOrders(ordersRes.data.data || []);
                } else {
                    console.warn("Không tìm thấy npp_id trong danh sách User.");
                }

            } catch (error) {
                console.error("Lỗi quy trình lấy đơn hàng NPP:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDistributorOrders();
    }, [user, setPageTitle, t]);

    const handleSearchChange = (e) => { setSearchTerm(e.target.value); setCurrentPage(1); };
    
    const filteredOrders = useMemo(() => {
        if (!searchTerm) return orders;
        const lower = searchTerm.toLowerCase();
        return orders.filter(o => 
            (o.ma_don_hang && o.ma_don_hang.toLowerCase().includes(lower)) ||
            (o.order_code && String(o.order_code).toLowerCase().includes(lower)) ||
            (o.khach_hang && o.khach_hang.toLowerCase().includes(lower)) ||
            (o.customer_name && o.customer_name.toLowerCase().includes(lower))
        );
    }, [orders, searchTerm]);
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const paginatedOrders = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredOrders.slice(start, start + itemsPerPage);
    }, [filteredOrders, currentPage, itemsPerPage]);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat(i18n.language === 'en' ? 'en-US' : 'vi-VN', { 
            style: 'currency', currency: 'VND' 
        }).format(val || 0);
    };

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
        <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="relative w-full md:w-80">
                    <input 
                        type="text" 
                        placeholder={t('npp.orders.searchPlaceholder')} 
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        <LuDownload /> {t('npp.orders.downloadCSV')}
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            {/* Các cột theo đúng yêu cầu */}
                            <th className="px-6 py-3">Mã đơn hàng</th>
                            <th className="px-6 py-3">Tổng tiền đơn hàng</th>
                            <th className="px-6 py-3">Trạng thái đơn hàng</th>
                            <th className="px-6 py-3">Role người tạo</th>
                            <th className="px-6 py-3">Khách hàng</th>
                            <th className="px-6 py-3">Ngày tạo</th>
                            <th className="px-6 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" className="text-center py-10">{t('general.loading')}</td></tr>
                        ) : paginatedOrders.length > 0 ? (
                            paginatedOrders.map((order) => (
                                <tr key={order.order_id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                    
                                    {/* 1. Mã đơn hàng */}
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                        {order.ma_don_hang || `#${order.order_id}`}
                                    </td>
                                    
                                    {/* 2. Tổng tiền đơn hàng */}
                                    <td className="px-6 py-4 dark:text-gray-300 font-bold text-blue-600 dark:text-blue-400">
                                        {formatCurrency(order.tong_tien)}
                                    </td>
                                    
                                    {/* 3. Trạng thái đơn hàng */}
                                    <td className="px-6 py-4">
                                        <StatusBadge status={order.trang_thai_don_hang} />
                                    </td>

                                    {/* 4. Role người tạo */}
                                    <td className="px-6 py-4">
                                        <RoleBadge role={order.role_nguoi_tao_don} />
                                    </td>
                                    
                                    {/* 5. Khách hàng */}
                                    <td className="px-6 py-4 dark:text-gray-300">
                                        {order.ten_khach_hang || 'Khách lẻ'}
                                    </td>
                                    
                                    {/* 6. Ngày tạo */}
                                    <td className="px-6 py-4 dark:text-gray-300">
                                        {new Date(order.tao_vao_luc).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'vi-VN')}
                                        <br/>
                                        <span className="text-xs text-gray-400">
                                            {new Date(order.tao_vao_luc).toLocaleTimeString(i18n.language === 'en' ? 'en-US' : 'vi-VN')}
                                        </span>
                                    </td>
                                    
                                    {/* Actions */}
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                            <LuEye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="7" className="text-center py-10">{t('npp.orders.notFound')}</td></tr>
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
    );
};

export default OrdersPage;