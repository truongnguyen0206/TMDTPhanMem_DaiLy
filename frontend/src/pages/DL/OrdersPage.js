import { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { LuSearch, LuFileSpreadsheet, LuEye, LuFileText } from 'react-icons/lu';
import { useTranslation } from 'react-i18next';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

// --- Component hiển thị Trạng thái ---
const StatusBadge = ({ status }) => {
    const { t } = useTranslation();
    const getStatusStyle = (s) => {
        if (!s) return { text: t('status.unknown'), color: 'bg-gray-100 text-gray-800' };
        const lowerS = String(s).toLowerCase();
        if (['paid', 'completed', 'thành công', 'đã hoàn thành', 'hoàn thành', 'delivered', 'giao hàng thành công'].includes(lowerS)) {
            return { text: t('dl.orders.success'), color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
        }
        if (['pending', 'chờ xử lý', 'pending payment', 'chưa thanh toán', 'shipping', 'đang giao hàng', 'đang xử lý'].includes(lowerS)) {
            return { text: s, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' };
        }
        if (['đã xác nhận'].includes(lowerS)) {
            return { text: s, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' };
        }
        if (['cancelled', 'đã hủy', 'failed'].includes(lowerS)) {
            return { text: t('dl.orders.failed'), color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' };
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

const CreatorBadge = ({ type, name }) => {
    const { t } = useTranslation();
    const isOwn = type === 'own';
    
    return (
        <div className="flex flex-col">
            <span className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                {isOwn ? t('dl.orders.sourceOwn') : name || t('dl.orders.sourceCtv')}
            </span>
            <span className="text-xs text-gray-500">
                {isOwn ? 'Đại lý' : 'Cộng tác viên'}
            </span>
        </div>
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
    const [agentId, setAgentId] = useState(null);
    const itemsPerPage = 10;

    // 1. Lấy Agent ID
    useEffect(() => {
        const fetchAgentId = async () => {
            if (!user || !user.id) return;
            try {
                const response = await axiosClient.get('/agent/getAllAgents');
                const currentAgent = response.data.find(a => a.user_id === user.id);
                if (currentAgent) {
                    setAgentId(currentAgent.agent_id);
                }
            } catch (error) {
                console.error("Error fetching agent ID:", error);
            }
        };
        fetchAgentId();
    }, [user]);

    // 2. Fetch dữ liệu
    useEffect(() => {
        setPageTitle(t('sidebar.orders'));

        const fetchOrders = async () => {
            if (!agentId) return;
            setLoading(true);
            try {
                const [ownOrdersRes, ctvOrdersRes, ctvListRes] = await Promise.all([
                    axiosClient.get(`/agent/${agentId}/orders`),
                    axiosClient.get(`/agent/${agentId}/ctv-orders`),
                    axiosClient.get(`/agent/getctv/${agentId}`)
                ]);

                // Map tên CTV
                const ctvList = ctvListRes.data.ctvList || [];
                const ctvNameMap = {};
                ctvList.forEach(ctv => {
                    if(ctv.user_id) ctvNameMap[ctv.user_id] = ctv.ctv_name; 
                });

                const ownOrders = (ownOrdersRes.data.data || []).map(o => ({ 
                    ...o, sourceType: 'own', sourceName: 'Me' 
                }));
                
                const ctvOrders = (ctvOrdersRes.data.data || []).map(o => ({ 
                    ...o, sourceType: 'ctv', sourceName: ctvNameMap[o.user_id] || t('dl.orders.sourceCtv') 
                }));

                const mergedOrders = [...ownOrders, ...ctvOrders].sort((a, b) => 
                    new Date(b.order_date) - new Date(a.order_date)
                );
                setOrders(mergedOrders);
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [agentId, setPageTitle, t, i18n.language]);
    const handleExport = async (type) => {
        try {
            const endpoint = type === 'excel' ? '/report/orders/excel' : '/report/orders/pdf';
            const extension = type === 'excel' ? 'xlsx' : 'pdf';
            
            // Gọi API với responseType là 'blob'
            const response = await axiosClient.get(endpoint, {
                params: { user_id: user.id }, 
                responseType: 'blob' 
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Danh_sach_don_hang_${new Date().getTime()}.${extension}`);
            document.body.appendChild(link);
            link.click();
            
            link.remove();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error(`Lỗi xuất file ${type}:`, error);
            alert(`Xuất file ${type} thất bại.`);
        }
    };

    // 3. Search & Pagination Logic
    const handleSearchChange = (e) => { setSearchTerm(e.target.value); setCurrentPage(1); };

    const filteredOrders = useMemo(() => {
        if (!searchTerm) return orders;
        const lower = searchTerm.toLowerCase();
        return orders.filter(o => 
            (o.order_code && o.order_code.toLowerCase().includes(lower)) ||
            (o.product_name && o.product_name.toLowerCase().includes(lower)) // Thêm tìm kiếm theo tên SP
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

    return (
        <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
            {/* Thanh tìm kiếm & Export */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="relative w-full md:w-auto">
                    <input
                        type="text"
                        placeholder={t('npp.orders.searchPlaceholder')}
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full md:w-80 bg-gray-50 border border-gray-300 rounded-md py-2 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => handleExport('excel')}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <LuFileSpreadsheet /> Xuất Excel
                    </button>
                    <button 
                        onClick={() => handleExport('pdf')}
                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        <LuFileText /> Xuất PDF
                    </button>
                </div>
            </div>

            {/* Bảng dữ liệu */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-3">{t('npp.orders.orderCodeHeader')}</th>
                            <th className="px-6 py-3">{t('dl.orders.productNameHeader')}</th>
                            <th className="px-6 py-3 text-center">{t('dl.orders.quantityHeader')}</th>
                            <th className="px-6 py-3">{t('npp.orders.valueHeader')}</th>
                            <th className="px-6 py-3">{t('npp.agents.statusHeader')}</th>
                            <th className="px-6 py-3">{t('dl.orders.sourceTypeHeader')}</th>
                            <th className="px-6 py-3">{t('npp.orders.createdDateHeader')}</th>
                            <th className="px-6 py-3 text-right"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                             <tr><td colSpan="8" className="text-center py-10">{t('general.loading')}</td></tr>
                        ) : paginatedOrders.length > 0 ? (
                            paginatedOrders.map((order) => (
                                <tr key={order.order_id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                        {order.order_code || `#${order.order_id}`}
                                    </td>
                                    <td className="px-6 py-4 dark:text-gray-300">
                                        {order.product_name || order.products?.[0]?.product_name || "Combo sản phẩm"}
                                    </td>
                                    <td className="px-6 py-4 text-center dark:text-gray-300">
                                        {order.quantity || order.total_quantity || 1}
                                    </td>
                                    <td className="px-6 py-4 font-medium dark:text-gray-300">
                                        {formatCurrency(order.total_amount)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={order.trang_thai_don_hang || order.order_status} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <CreatorBadge type={order.sourceType} name={order.sourceName} />
                                    </td>
                                    <td className="px-6 py-4 dark:text-gray-300">
                                        {new Date(order.order_date).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'vi-VN')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50" title={t('general.viewDetail')}>
                                                <LuEye size={18} />
                                            </button>
                                            {/* {order.sourceType === 'own' && (
                                                <button className="p-2 text-gray-400 hover:text-green-600 rounded-full hover:bg-green-50" title={t('general.update')}>
                                                    <LuPencil size={18} />
                                                </button>
                                            )} */}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="8" className="text-center py-10">{t('npp.orders.notFound')}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {/* Phân trang */}
            <div className="flex justify-between items-center mt-6">
                <p className="text-sm text-gray-500">
                    {t('general.showingResults', { 
                        start: paginatedOrders.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0,
                        end: (currentPage - 1) * itemsPerPage + paginatedOrders.length,
                        total: filteredOrders.length
                    })}
                </p>
                <div className="flex gap-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 rounded border bg-white disabled:opacity-50">{'<'}</button>
                    {renderPagination()}
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 rounded border bg-white disabled:opacity-50">{'>'}</button>
                </div>
            </div>
        </div>
    );
};

export default OrdersPage;