import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext, useLocation } from 'react-router-dom';
import { LuPencil, LuSearch, LuEye, LuCalendar, LuX, LuFileSpreadsheet, LuFileText, LuTrash2 } from 'react-icons/lu'; // Thêm icon mới
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import axiosClient from '../../api/axiosClient';
import OrderDetailModal from '../../components/Order/OrderDetailModal';
import OrderStatusModal from '../../components/Order/OrderStatusModal';
import { useAuth } from '../../context/AuthContext';

// --- DỮ LIỆU MẪU BIỂU ĐỒ ---
const weeklyCommissionData = [
    { name: 'Mon', value: 12000, color: '#FECACA' }, { name: 'Tue', value: 20000, color: '#FECACA' },
    { name: 'Wed', value: 15000, color: '#FECACA' }, { name: 'Thu', value: 27000, color: '#F87171' },
    { name: 'Fri', value: 18000, color: '#FECACA' }, { name: 'Sat', value: 23000, color: '#FECACA' },
    { name: 'Sun', value: 30000, color: '#FECACA' },
];

// --- CÁC COMPONENT CON (HELPER) ---
// --- COMPONENT CON ---
const StatCard = ({ title, value }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-200 text-center shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center h-32">
        <p className="text-gray-500 text-sm mb-2">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
);

const formatCurrency = (value) => {
    if (value === null || value === undefined) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const SourceBadge = ({ source }) => {
    let style = { text: source || 'Khác', color: 'bg-gray-100 text-gray-600' };
    const s = String(source).toLowerCase();
    if (s.includes('cộng tác viên') || s.includes('ctv')) style = { text: 'Cộng tác viên', color: 'bg-yellow-100 text-yellow-800' };
    else if (s.includes('nhà phân phối') || s.includes('npp')) style = { text: 'Nhà phân phối', color: 'bg-purple-100 text-purple-800' };
    else if (s.includes('đại lý')) style = { text: 'Đại lý', color: 'bg-blue-100 text-blue-800' };
    return <span className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${style.color}`}>{style.text}</span>;
};

const OrderStatusBadge = ({ status }) => {
    let style = { text: status || 'N/A', color: 'bg-gray-100 text-gray-600' };
    const s = String(status || '').toLowerCase();
    if (s.includes('chờ') || s.includes('pending')) style = { text: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800' };
    else if (s.includes('hoàn thành') || s.includes('thành công')) style = { text: 'Hoàn thành', color: 'bg-green-100 text-green-800' };
    else if (s.includes('hủy')) style = { text: 'Đã hủy', color: 'bg-red-100 text-red-800' };
    return <span className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${style.color}`}>{style.text}</span>;
};

const PaymentStatusBadge = ({ status }) => {
    let style = { text: 'Chờ thanh toán', color: 'bg-red-100 text-red-800' };
    const s = String(status).toLowerCase();
    if (s === 'paid' || s.includes('đã') || s === 'true') style = { text: 'Đã thanh toán', color: 'bg-green-100 text-green-800' };
    return <span className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${style.color}`}>{style.text}</span>;
};

// --- COMPONENT CHÍNH ---
const OrdersPage = () => {
    const { setPageTitle } = useOutletContext();
    const location = useLocation();

    // Dữ liệu
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // --- BỘ LỌC NÂNG CAO (Đáp ứng UC-27 & NF3) ---
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterSource, setFilterSource] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Thống kê
    const [stats, setStats] = useState({
        pending_orders: 0, pending_payment: 0, via_ctv: 0, via_npp: 0, returned: 0, total_revenue: 0, via_agent: 0, top_partners: []
    });
    // State cho Modal
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedOrderForEdit, setSelectedOrderForEdit] = useState(null);

    useEffect(() => {
        setPageTitle('Quản lý Đơn hàng');
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                // Lấy limit lớn để lọc client-side mượt mà
                const ordersRes = await axiosClient.get('/order/with-origin?limit=10000');
                setOrders(ordersRes.data || []);

                const statsRes = await axiosClient.get('/api/dashboard/admin/stats');
                if (statsRes.data && statsRes.data.success) {
                    setStats(statsRes.data.data);
                }
            } catch (err) {
                console.error("Lỗi tải dữ liệu:", err);
                setError('Không thể tải dữ liệu.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [setPageTitle]);

    useEffect(() => {
        if (location.state?.autoFilterStatus) {
            // Set giá trị cho bộ lọc ('pending')
            setFilterStatus(location.state.autoFilterStatus);

            // Xóa state để tránh bị kẹt bộ lọc khi reload
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    // Reset trang khi filter đổi
    useEffect(() => { setCurrentPage(1); }, [searchTerm, filterStatus, filterSource, startDate, endDate]);

    // --- LOGIC LỌC ĐA ĐIỀU KIỆN ---
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const sLower = searchTerm.toLowerCase();
            // 1. Tìm kiếm
            const matchSearch = !searchTerm ||
                (order.ma_don_hang?.toLowerCase().includes(sLower)) ||
                (order.nguoi_gioi_thieu?.toLowerCase().includes(sLower));

            // 2. Trạng thái
            const stLower = (order.trang_thai_don_hang || '').toLowerCase();
            const matchStatus = !filterStatus ||
                (filterStatus === 'pending' && stLower.includes('chờ')) ||
                (filterStatus === 'completed' && (stLower.includes('hoàn thành') || stLower.includes('thành công'))) ||
                (filterStatus === 'cancelled' && stLower.includes('hủy'));

            // 3. Nguồn đơn
            const srcLower = (order.nguon_tao_don || '').toLowerCase();
            const matchSource = !filterSource ||
                (filterSource === 'agent' && srcLower.includes('đại lý')) ||
                (filterSource === 'ctv' && srcLower.includes('cộng tác viên')) ||
                (filterSource === 'npp' && srcLower.includes('nhà phân phối'));

            // 4. Ngày tháng
            let matchDate = true;
            if (order.tao_vao_luc) {
                const d = new Date(order.tao_vao_luc).setHours(0, 0, 0, 0);
                if (startDate && d < new Date(startDate).setHours(0, 0, 0, 0)) matchDate = false;
                if (endDate && d > new Date(endDate).setHours(23, 59, 59, 999)) matchDate = false;
            }

            return matchSearch && matchStatus && matchSource && matchDate;
        });
    }, [orders, searchTerm, filterStatus, filterSource, startDate, endDate]);

    // Phân trang
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

    const renderPagination = () => { /* Logic pagination như cũ */
        let pages = [];
        for (let i = 1; i <= Math.min(totalPages, 5); i++) pages.push(
            <button key={i} onClick={() => setCurrentPage(i)} className={`w-8 h-8 rounded border ${currentPage === i ? 'bg-blue-600 text-white' : 'bg-white'}`}>{i}</button>
        );
        return pages;
    };

    const handleExport = async (type) => {
        try {
            const endpoint = type === 'excel' 
                ? `/report/orders/excel/${user.id}` 
                : `/report/orders/pdf/${user.id}`;
            const extension = type === 'excel' ? 'xlsx' : 'pdf';
            const response = await axiosClient.get(endpoint, { responseType: 'blob' });
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


    const handleViewDetail = async (order) => {
        setSelectedOrder(order);
    };

    const handleCloseModal = () => {
        setSelectedOrder(null);
    };

    const handleEditClick = (order) => {
        setSelectedOrderForEdit(order);
    };

    // Hàm xử lý Update gọi API
    const handleUpdateStatus = async (orderId, updateData) => {
        try {
            // Gọi API lên Backend (Backend sẽ dùng model để xử lý DB)
            await axiosClient.put(`/order/updateOrder/${orderId}`, updateData);

            // Cập nhật giao diện
            setOrders(prevOrders => prevOrders.map(o =>
                o.order_id === orderId ? {
                    ...o,
                    trang_thai_don_hang: updateData.order_status,
                    trang_thai_thanh_toan: updateData.payment_status
                } : o
            ));

            alert(`Cập nhật thành công!`);
            setSelectedOrderForEdit(null);
        } catch (err) {
            console.error("Lỗi update:", err);
            alert("Cập nhật thất bại.");
        }
    };

    return (
        <div className="space-y-6">
            {/* THỐNG KÊ */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard title="Đơn chờ xử lý" value={stats.pending_orders} />
                <StatCard title="Chờ thanh toán" value={stats.pending_payment} />
                <StatCard title="Qua CTV" value={stats.via_ctv} />
                <StatCard title="Qua NPP" value={stats.via_npp} />
                <StatCard title="Đã hủy" value={stats.returned} />
                <StatCard title="Tổng doanh thu" value={formatCurrency(stats.total_revenue)} />
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative text-sm" role="alert">
                    <strong className="font-bold">Đã có lỗi xảy ra: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {/* MAIN CONTENT */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">

                {/* --- TOOLBAR NÂNG CAO  --- */}
                <div className="flex flex-col gap-4 mb-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-800">Danh sách đơn hàng</h3>
                        {/* Nút Xuất Excel */}
                        <div className="flex gap-2">
                            <button onClick={handleExport} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium">
                                <LuFileSpreadsheet /> Xuất Excel
                            </button>
                            <button onClick={handleExport} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium">
                                <LuFileText /> Xuất PDF
                            </button>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="flex flex-wrap gap-3 items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div className="relative">
                            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="text" placeholder="Mã đơn, Người GT..." className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 w-60"
                                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>

                        {/* Dropdown Status */}
                        <select className="py-2 px-3 border border-gray-300 rounded-md text-sm bg-white cursor-pointer"
                            value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                            <option value="">Tất cả trạng thái</option>
                            <option value="pending">Chờ xử lý</option>
                            <option value="completed">Hoàn thành</option>
                            <option value="cancelled">Đã hủy</option>
                        </select>

                        {/* Dropdown Source */}
                        <select className="py-2 px-3 border border-gray-300 rounded-md text-sm bg-white cursor-pointer"
                            value={filterSource} onChange={e => setFilterSource(e.target.value)}>
                            <option value="">Tất cả nguồn</option>
                            <option value="npp">Nhà phân phối</option>
                            <option value="agent">Đại lý</option>
                            <option value="ctv">Cộng tác viên</option>
                        </select>

                        {/* Date Range */}
                        <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-md px-2 py-1">
                            <LuCalendar className="text-gray-400" />
                            <input type="date" className="text-sm outline-none text-gray-600" value={startDate} onChange={e => setStartDate(e.target.value)} />
                            <span className="text-gray-400">-</span>
                            <input type="date" className="text-sm outline-none text-gray-600" value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </div>

                        {(searchTerm || filterStatus || filterSource || startDate) && (
                            <button onClick={() => { setSearchTerm(''); setFilterStatus(''); setFilterSource(''); setStartDate(''); setEndDate('') }} className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1">
                                <LuX /> Xóa lọc
                            </button>
                        )}
                    </div>
                </div>

                {/* TABLE */}
                <div className="overflow-x-auto border border-gray-100 rounded-lg">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3">Mã Đơn</th>
                                <th className="px-6 py-3">Sản phẩm</th>
                                <th className="px-6 py-3 text-center">SL</th>
                                <th className="px-6 py-3">Tổng tiền</th>
                                <th className="px-6 py-3">Nguồn</th>
                                <th className="px-6 py-3">Người tạo đơn</th>
                                <th className="px-6 py-3">Ngày tạo</th>
                                <th className="px-6 py-3 text-center">Trạng thái</th>
                                <th className="px-6 py-3 text-center">Thanh toán</th>
                                <th className="px-6 py-3 text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="10" className="text-center py-10">Đang tải...</td></tr>
                            ) : currentItems.length === 0 ? (
                                <tr><td colSpan="10" className="text-center py-10">Không tìm thấy đơn hàng.</td></tr>
                            ) : (
                                currentItems.map((order) => {
                                    // ✅ LOGIC QUAN TRỌNG (UC-15 B2): Kiểm tra trạng thái để khóa sửa xóa
                                    const statusLower = (order.trang_thai_don_hang || '').toLowerCase();
                                    const isCompleted = statusLower.includes('hoàn thành') || statusLower.includes('thành công');
                                    const isCancelled = statusLower.includes('hủy');
                                    const isLocked = isCompleted || isCancelled; // Đơn đã xong hoặc hủy thì khóa

                                    return (
                                        <tr key={order.ma_don_hang} className="bg-white hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-blue-600 cursor-pointer" onClick={() => handleViewDetail(order)}>
                                                {order.ma_don_hang}
                                            </td>

                                            {/* 🛡️ 1. SẢN PHẨM: Nếu null thì hiện text xám */}
                                            <td className="px-6 py-4 truncate max-w-[150px]" title={order.san_pham}>
                                                {order.san_pham || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                                            </td>

                                            {/* 🛡️ 2. SỐ LƯỢNG: Nếu null thì hiện 0 */}
                                            <td className="px-6 py-4 text-center">
                                                {order.so_luong || 0}
                                            </td>

                                            <td className="px-6 py-4 font-bold text-gray-900">{formatCurrency(order.tong_tien)}</td>
                                            <td className="px-6 py-4"><SourceBadge source={order.nguon_tao_don} /></td>

                                            {/* 🛡️ 3. NGƯỜI TẠO ĐƠN: Nếu null thì hiện 'Khách lẻ / System' */}
                                            <td className="px-6 py-4">
                                                {order.nguoi_tao_don || <span className="text-gray-400">Khách lẻ / System</span>}
                                            </td>

                                            <td className="px-6 py-4">{order.tao_vao_luc ? new Date(order.tao_vao_luc).toLocaleDateString('vi-VN') : '-'}</td>
                                            <td className="px-6 py-4 text-center"><OrderStatusBadge status={order.trang_thai_don_hang} /></td>
                                            <td className="px-6 py-4 text-center"><PaymentStatusBadge status={order.trang_thai_thanh_toan} /></td>

                                            {/* CỘT HÀNH ĐỘNG */}
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {/* Nút Xem (Luôn hiện) */}
                                                    <button
                                                        onClick={() => handleViewDetail(order)}
                                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Xem chi tiết">
                                                        <LuEye size={18} />
                                                    </button>

                                                    {/* Nút Sửa (Chỉ hiện khi chưa khóa) */}
                                                    {!isLocked && (
                                                        <button
                                                            onClick={() => handleEditClick(order)}
                                                            className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded" title="Cập nhật trạng thái">
                                                            <LuPencil size={18} />
                                                        </button>
                                                    )}

                                                    {/* Nút Xóa (Chỉ hiện khi chưa khóa) */}
                                                    {!isLocked && (
                                                        <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="Hủy đơn hàng">
                                                            <LuTrash2 size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {selectedOrder && (
                    <OrderDetailModal
                        order={selectedOrder}
                        onClose={handleCloseModal}
                    />
                )}
                {selectedOrderForEdit && (
                    <OrderStatusModal
                        order={selectedOrderForEdit}
                        onClose={() => setSelectedOrderForEdit(null)}
                        onUpdate={handleUpdateStatus}
                    />
                )}

                {/* FOOTER: PHÂN TRANG */}
                {!loading && filteredOrders.length > 0 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                        <p className="text-sm text-gray-500">
                            Hiển thị <span className="font-medium">{indexOfFirstItem + 1}</span> đến <span className="font-medium">{Math.min(indexOfLastItem, filteredOrders.length)}</span> của <span className="font-medium">{filteredOrders.length}</span> kết quả
                        </p>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="w-8 h-8 border rounded hover:bg-gray-50 disabled:opacity-50">{'<'}</button>
                            {renderPagination()}
                            <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="w-8 h-8 border rounded hover:bg-gray-50 disabled:opacity-50">{'>'}</button>
                        </div>
                    </div>
                )}
            </div>

            {/* --- PHẦN 3: PHÂN TÍCH (GIỮ NGUYÊN) --- */}
            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Phân tích</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Tỷ lệ nguồn */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h4 className="font-bold mb-4">Tỷ lệ nguồn đơn hàng</h4>
                        <div className="space-y-4">
                            {(() => {
                                const total = (stats.via_npp || 0) + (stats.via_ctv || 0) + (stats.via_agent || 0);
                                const getPercent = (val) => total > 0 ? (val / total) * 100 : 0;
                                return (
                                    <>
                                        <div><div className="flex justify-between text-sm mb-1"><span>Nhà Phân Phối</span><span>{stats.via_npp || 0}</span></div><div className="w-full bg-gray-100 rounded-full h-2.5"><div className="bg-purple-500 h-2.5 rounded-full" style={{ width: `${getPercent(stats.via_npp)}%` }}></div></div></div>
                                        <div><div className="flex justify-between text-sm mb-1"><span>Cộng tác viên</span><span>{stats.via_ctv || 0}</span></div><div className="w-full bg-gray-100 rounded-full h-2.5"><div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: `${getPercent(stats.via_ctv)}%` }}></div></div></div>
                                        <div><div className="flex justify-between text-sm mb-1"><span>Đại lý</span><span>{stats.via_agent || 0}</span></div><div className="w-full bg-gray-100 rounded-full h-2.5"><div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${getPercent(stats.via_agent)}%` }}></div></div></div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>

                    {/* Top Đối Tác */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h4 className="font-bold mb-4">Top Đối tác hiệu quả</h4>
                        <div className="space-y-3">
                            {stats.top_partners && stats.top_partners.length > 0 ? (
                                stats.top_partners.map((partner, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 border-b border-gray-50 last:border-0">
                                        <div className="flex items-center gap-3 min-w-0 flex-1 mr-4">
                                            <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white flex-shrink-0 ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-blue-100 text-blue-600'}`}>{index + 1}</span>
                                            <p className="font-medium text-gray-800 truncate" title={partner.name}>{partner.name}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-green-600 font-bold text-sm whitespace-nowrap">{formatCurrency(partner.revenue)}</p>
                                            <p className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-1">{partner.orders} Đơn</p>
                                        </div>
                                    </div>
                                ))
                            ) : <p className="text-center text-gray-500 py-10">Chưa có dữ liệu.</p>}
                        </div>
                    </div>

                    {/* Biểu đồ hoa hồng */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h4 className="font-bold mb-4">Hoa hồng ước tính (Tuần)</h4>
                        <div style={{ width: '100%', height: 150 }}>
                            <ResponsiveContainer>
                                <BarChart data={weeklyCommissionData} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                                    <XAxis type="number" hide /><YAxis type="category" dataKey="name" tickLine={false} axisLine={false} interval={0} width={30} /><Tooltip cursor={{ fill: 'transparent' }} /><Bar dataKey="value" barSize={12} radius={[0, 4, 4, 0]}>{weeklyCommissionData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}</Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default OrdersPage;