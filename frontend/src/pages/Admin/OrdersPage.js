import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { LuPencil, LuSearch, LuEllipsisVertical } from 'react-icons/lu';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import axiosClient from '../../api/axiosClient';

// --- DỮ LIỆU MẪU CHO BIỂU ĐỒ (GIỮ NGUYÊN) ---
const weeklyCommissionData = [
  { name: 'Mon', value: 12000, color: '#FECACA' }, { name: 'Tue', value: 20000, color: '#FECACA' },
  { name: 'Wed', value: 15000, color: '#FECACA' }, { name: 'Thu', value: 27000, color: '#F87171' },
  { name: 'Fri', value: 18000, color: '#FECACA' }, { name: 'Sat', value: 23000, color: '#FECACA' },
  { name: 'Sun', value: 30000, color: '#FECACA' },
];

// --- CÁC COMPONENT CON (HELPER) ---

// 1. Thẻ thống kê
const StatCard = ({ title, value, unit }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-200 text-center shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center h-32">
        <p className="text-gray-500 text-sm mb-2">{title}</p>
        <p className="text-3xl font-bold text-gray-800">
            {value} {unit && <span className="text-xl font-medium">{unit}</span>}
        </p>
    </div>
);

// 2. Helper format tiền tệ
const formatCurrency = (value) => {
    if (value === null || value === undefined) return '0 ₫';
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(numValue);
};

// 3. Badge cho Nguồn Phát Sinh
const SourceBadge = ({ source }) => {
    let style = { text: source || 'Không xác định', color: 'bg-gray-100 text-gray-600' };
    const s = String(source).toLowerCase();

    if (s.includes('cộng tác viên') || s.includes('ctv')) {
        style = { text: 'Cộng tác viên', color: 'bg-yellow-100 text-yellow-800' };
    } else if (s.includes('nhà phân phối') || s.includes('npp') || s === 'system') {
        style = { text: 'Nhà phân phối', color: 'bg-purple-100 text-purple-800' };
    } else if (s.includes('đại lý')) {
        style = { text: 'Đại lý', color: 'bg-blue-100 text-blue-800' };
    } else if (s.includes('khách hàng')) {
        style = { text: 'Khách hàng', color: 'bg-green-100 text-green-800' };
    }

    return (
        <span className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${style.color}`}>
            {style.text}
        </span>
    );
};

// 4. Badge cho Trạng Thái ĐH
const OrderStatusBadge = ({ status }) => {
    let style = { text: status || 'N/A', color: 'bg-gray-100 text-gray-600' };
    const s = String(status).toLowerCase();

    if (s.includes('chờ xử lý') || s === 'pending' || s === '1') {
        style = { text: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800' };
    } else if (s.includes('hoàn thành') || s === 'completed' || s === '2') {
        style = { text: 'Hoàn thành', color: 'bg-green-100 text-green-800' };
    } else if (s.includes('đã hủy') || s === 'cancelled' || s === '3') {
        style = { text: 'Đã hủy', color: 'bg-red-100 text-red-800' };
    } else if (s.includes('hoàn') || s.includes('returned')) {
        style = { text: 'Đã hoàn', color: 'bg-gray-200 text-gray-700' };
    }

    return (
        <span className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${style.color}`}>
            {style.text}
        </span>
    );
};

// 5. Badge cho Thanh Toán
const PaymentStatusBadge = ({ status }) => {
    let style = { text: 'Chờ thanh toán', color: 'bg-red-100 text-red-800' }; 
    const s = String(status).toLowerCase();
    if (s === 'paid' || s === 'đã thanh toán' || s === 'true') {
        style = { text: 'Đã thanh toán', color: 'bg-green-100 text-green-800' };
    }
    return <span className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${style.color}`}>{style.text}</span>;
};

// --- COMPONENT CHÍNH ---
const OrdersPage = () => {
    const { setPageTitle } = useOutletContext();
    
    // State
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // State Thống kê (Bao gồm cả top_partners)
    const [stats, setStats] = useState({
        pending_orders: 0,
        pending_payment: 0,
        via_ctv: 0,
        via_npp: 0,
        returned: 0,
        total_revenue: 0,
        via_agent: 0,
        top_partners: [] // Mảng chứa danh sách top đối tác
    });
    
    useEffect(() => {
        setPageTitle('Đơn hàng');
        
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                // 1. Lấy danh sách đơn hàng
                const ordersRes = await axiosClient.get('/order/with-origin');
                setOrders(ordersRes.data || []);

                // 2. Lấy thống kê & Top đối tác
                const statsRes = await axiosClient.get('/api/dashboard/admin/stats');
                if (statsRes.data && statsRes.data.success) {
                    setStats(statsRes.data.data);
                }
            } catch (err) {
                console.error("Error loading data:", err);
                setError('Không thể tải dữ liệu.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [setPageTitle]);

    // Filter logic
    const filteredOrders = useMemo(() => {
        if (!searchTerm) return orders;
        const lowerSearch = searchTerm.toLowerCase();
        return orders.filter(order => 
            (order.ma_don_hang && order.ma_don_hang.toLowerCase().includes(lowerSearch)) ||
            (order.san_pham && order.san_pham.toLowerCase().includes(lowerSearch)) ||
            (order.nguoi_gioi_thieu && order.nguoi_gioi_thieu.toLowerCase().includes(lowerSearch)) ||
            (order.nguon_tao_don && order.nguon_tao_don.toLowerCase().includes(lowerSearch))
        );
    }, [orders, searchTerm]);

    // Tổng số đơn để tính % biểu đồ (tránh chia cho 0)
    const totalSourceOrders = (stats.via_npp || 0) + (stats.via_ctv || 0) + (stats.via_agent || 0);
    const denominator = totalSourceOrders > 0 ? totalSourceOrders : 1;

    return (
        <div className="space-y-6">
            {/* --- PHẦN 1: THẺ THỐNG KÊ --- */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                 {/* 1. Đơn hàng chờ xử lý */}
                 <StatCard title="Đơn hàng chờ xử lý" value={stats.pending_orders} />
                 
                 {/* 2. Đơn hàng chờ thanh toán */}
                 <StatCard title="Đơn hàng chờ thanh toán" value={stats.pending_payment} />
                 
                 {/* 3. Đơn hàng qua CTV */}
                 <StatCard title="Đơn hàng qua CTV" value={stats.via_ctv} />
                 
                 {/* 4. Đơn hàng qua NPP */}
                 <StatCard title="Đơn hàng qua NPP" value={stats.via_npp} />
                 
                 {/* 5. Đơn hàng bị hoàn */}
                 <StatCard title="Đơn hàng bị hoàn" value={stats.returned} />
                 
                 {/* 6. Tổng doanh thu */}
                 <StatCard title="Tổng doanh thu" value={formatCurrency(stats.total_revenue)} />
            </div>

            {/* --- PHẦN 2: BẢNG DANH SÁCH ĐƠN HÀNG --- */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                    <h3 className="text-lg font-bold text-gray-800">Danh sách đơn hàng được phân phối</h3>
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Tìm theo mã đơn, tên SP, tên ĐL/CTV" 
                            className="w-full sm:w-80 bg-gray-50 border border-gray-200 rounded-lg py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    </div>
                </div>
                
                {error && <div className="text-red-500 text-center mb-4">{error}</div>}

                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 font-semibold">MÃ ĐƠN HÀNG</th>
                                <th className="px-6 py-3 font-semibold">SẢN PHẨM</th>
                                <th className="px-6 py-3 font-semibold text-center">SỐ LƯỢNG</th>
                                <th className="px-6 py-3 font-semibold">GIÁ</th>
                                <th className="px-6 py-3 font-semibold">TỔNG TIỀN</th>
                                <th className="px-6 py-3 font-semibold">NGUỒN PHÁT SINH</th>
                                <th className="px-6 py-3 font-semibold">TÀI KHOẢN</th>
                                <th className="px-6 py-3 font-semibold">NGÀY TẠO</th>
                                <th className="px-6 py-3 font-semibold text-center">TRẠNG THÁI ĐH</th>
                                <th className="px-6 py-3 font-semibold text-center">THANH TOÁN</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="11" className="text-center py-10 text-gray-500">Đang tải dữ liệu...</td></tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr><td colSpan="11" className="text-center py-10 text-gray-500">Không tìm thấy đơn hàng nào.</td></tr>
                            ) : (
                                filteredOrders.map((order, index) => (
                                    <tr key={order.ma_don_hang || index} className="bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{order.ma_don_hang}</td>
                                        <td className="px-6 py-4 text-gray-600">{order.san_pham || 'test'}</td>
                                        <td className="px-6 py-4 text-center text-gray-600">{order.so_luong}</td>
                                        <td className="px-6 py-4 text-gray-600">{formatCurrency(order.gia)}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{formatCurrency(order.tong_tien)}</td>
                                        <td className="px-6 py-4"><SourceBadge source={order.nguon_tao_don} /></td>
                                        <td className="px-6 py-4 text-gray-600">{order.nguoi_gioi_thieu || order.nguoi_tao_don || 'N/A'}</td>
                                        <td className="px-6 py-4 text-gray-600">{order.tao_vao_luc ? new Date(order.tao_vao_luc).toLocaleDateString('en-GB') : '-'}</td>
                                        <td className="px-6 py-4 text-center"><OrderStatusBadge status={order.trang_thai_don_hang || 'Chờ xử lý'} /></td>
                                        <td className="px-6 py-4 text-center"><PaymentStatusBadge status={order.trang_thai_thanh_toan} /></td>
                                        <td className="px-6 py-4 text-center">
                                            <button className="text-gray-400 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50 transition-colors">
                                                <LuPencil size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {!loading && filteredOrders.length > 0 && (
                    <div className="flex justify-between items-center mt-4 text-sm text-gray-500"><p>Hiển thị {filteredOrders.length} đơn hàng</p></div>
                )}
            </div>

            {/* --- PHẦN 3: PHÂN TÍCH --- */}
            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Phân tích</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Tỷ lệ nguồn đơn hàng */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h4 className="font-bold mb-4">Tỷ lệ nguồn đơn hàng</h4>
                        <div className="space-y-4">
                            {/* NPP */}
                            <div>
                                <div className="flex justify-between text-sm mb-1"><span className="font-medium text-gray-700">Nhà Phân Phối</span><span className="text-gray-600">{stats.via_npp || 0}</span></div>
                                <div className="w-full bg-gray-100 rounded-full h-2.5"><div className="bg-purple-500 h-2.5 rounded-full transition-all duration-500" style={{width: `${((stats.via_npp || 0) / denominator) * 100}%`}}></div></div>
                            </div>
                            {/* CTV */}
                            <div>
                                <div className="flex justify-between text-sm mb-1"><span className="font-medium text-gray-700">Cộng tác viên</span><span className="text-gray-600">{stats.via_ctv || 0}</span></div>
                                <div className="w-full bg-gray-100 rounded-full h-2.5"><div className="bg-yellow-400 h-2.5 rounded-full transition-all duration-500" style={{width: `${((stats.via_ctv || 0) / denominator) * 100}%`}}></div></div>
                            </div>
                            {/* Đại lý */}
                            <div>
                                <div className="flex justify-between text-sm mb-1"><span className="font-medium text-gray-700">Đại lý</span><span className="text-gray-600">{stats.via_agent || 0}</span></div>
                                <div className="w-full bg-gray-100 rounded-full h-2.5"><div className="bg-blue-500 h-2.5 rounded-full transition-all duration-500" style={{width: `${((stats.via_agent || 0) / denominator) * 100}%`}}></div></div>
                            </div>
                        </div>
                    </div>
                    
                    {/* ✅ TOP ĐỐI TÁC HIỆU QUẢ (CẬP NHẬT MỚI: TÊN - DOANH SỐ - SỐ ĐƠN) */}
                     <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h4 className="font-bold mb-4">Top Đối tác hiệu quả</h4>
                        <div className="space-y-0">
                            {stats.top_partners && stats.top_partners.length > 0 ? (
                                stats.top_partners.map((partner, index) => (
                                    <div key={index} className="grid grid-cols-12 items-center p-3 hover:bg-gray-50 rounded transition-colors border-b border-gray-50 last:border-0">
                                        {/* Tên */}
                                        <p className="col-span-5 font-medium text-gray-800 truncate pr-2" title={partner.name}>
                                            {partner.name}
                                        </p>
                                        
                                        {/* Doanh thu */}
                                        <p className="col-span-4 text-green-600 font-semibold text-sm">
                                            {formatCurrency(partner.total_revenue)}
                                        </p>
                                        
                                        {/* Số đơn */}
                                        <p className="col-span-3 text-gray-500 text-right text-sm">
                                            {partner.total_orders} Đơn
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-10">Chưa có dữ liệu đối tác</p>
                            )}
                        </div>
                    </div>

                    {/* Biểu đồ hoa hồng (Demo) */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h4 className="font-bold mb-4">Hoa hồng ước tính (Tuần)</h4>
                         <div style={{ width: '100%', height: 150 }}>
                            <ResponsiveContainer>
                                <BarChart data={weeklyCommissionData} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} interval={0} width={30} />
                                    <Tooltip cursor={{fill: 'transparent'}} />
                                    <Bar dataKey="value" barSize={12} radius={[0, 4, 4, 0]}>
                                        {weeklyCommissionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
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