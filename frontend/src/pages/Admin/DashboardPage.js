import { useState, useEffect, useRef } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { LuEllipsisVertical, LuTrendingUp, LuTrendingDown, LuPackage, LuChartBar, LuCopy, LuUserPlus } from 'react-icons/lu';
import axiosClient from '../../api/axiosClient';
import { connectSocket } from '../../realtime/socketClient';

// --- COMPONENT CON ---

// 1. Dòng hiển thị Top Đối Tác
const TopAgentCard = ({ name, sales, orders }) => {
    const safeSales = Number(sales) || 0;
    const safeOrders = Number(orders) || 0;
    return (
        <div className="grid grid-cols-12 items-center p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
            <p className="col-span-5 font-bold text-gray-800 truncate pr-4" title={name}>{name || 'Không xác định'}</p>
            <p className="col-span-4 text-green-600 font-medium">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(safeSales)}
            </p>
            <p className="col-span-2 text-gray-500 text-center bg-gray-100 rounded-md py-1 text-xs font-semibold">{safeOrders} Đơn</p>
            <div className="col-span-1 flex justify-end"><button className="text-gray-400 hover:text-gray-600"><LuEllipsisVertical size={20} /></button></div>
        </div>
    );
};

// 2. Thẻ thống kê
const StatCard = ({ icon, title, value, growth, subText }) => {
    const isPositive = growth >= 0;
    const growthColor = isPositive ? 'text-green-600' : 'text-red-500';
    const GrowthIcon = isPositive ? LuTrendingUp : LuTrendingDown;

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-4">
                <p className="text-gray-500 font-medium text-sm">{title}</p>
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">{icon}</div>
            </div>
            
            <div className="mt-auto">
                <p className="text-2xl font-bold text-gray-800 mb-2">{value}</p>
                
                {/* Logic hiển thị phần % hoặc Subtext */}
                {growth !== undefined ? (
                    <div className={`flex items-center gap-1 text-xs font-medium ${growthColor}`}>
                        <GrowthIcon size={14} />
                        <span>{Math.abs(growth).toFixed(1)}%</span>
                        <span className="text-gray-400 ml-1 font-normal">so với tháng trước</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1 text-xs font-medium text-orange-500">
                        <span>{subText}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- COMPONENT CHÍNH ---
const DashboardPage = () => {
    const { setPageTitle } = useOutletContext();
    const navigate = useNavigate();
    
    // State lưu dữ liệu thực từ API
    const [stats, setStats] = useState({
        stats_cards: { // Cấu trúc mới từ Backend
            total_orders: { value: 0, growth: 0 },
            total_revenue: { value: 0, growth: 0 },
            pending_orders: { value: 0 },
            new_customers: { value: 0, growth: 0 }
        },
        top_partners: [],
        monthly_stats: []
    });
    const [loading, setLoading] = useState(true);
    const refreshTimerRef = useRef(null);

    // 🆕 State chọn chế độ xem: 'year' (Năm nay) hoặc 'week' (Tuần này)
    const [groupBy, setGroupBy] = useState('year');

    // Hàm gọi API
    const fetchData = async (groupType) => {
        setLoading(true);
        try {
            // Gọi API với tham số groupBy
            const url = `/api/dashboard/admin/stats?groupBy=${groupType}`;
            const res = await axiosClient.get(url);
            if (res.data && res.data.success) {
                setStats(res.data.data);
            }
        } catch (error) {
            console.error("Lỗi tải dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    // Gọi API khi groupBy thay đổi hoặc mới vào trang
    useEffect(() => {
        setPageTitle('Dashboard');
        fetchData(groupBy);
    }, [setPageTitle, groupBy]);

    // 🔥 Realtime: có thay đổi (đơn hàng / user / commission...) thì tự reload dashboard
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const socket = connectSocket();

        const onInvalidate = () => {
            // Debounce tránh spam gọi API nếu nhiều event liên tục
            if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
            refreshTimerRef.current = setTimeout(() => {
                fetchData(groupBy);
            }, 250);
        };

        socket.on('dashboard:invalidate', onInvalidate);

        return () => {
            socket.off('dashboard:invalidate', onInvalidate);
            if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
        };
    }, [groupBy]);

    const formatNumber = (num) => new Intl.NumberFormat('vi-VN').format(num || 0);
    const formatMoney = (num) => new Intl.NumberFormat('vi-VN', { notation: "compact", compactDisplay: "short" }).format(num || 0) + 'đ';
    const cards = stats.stats_cards || {};

    const clickableCardClass = "cursor-pointer transition-transform hover:scale-105 active:scale-95 h-full";
    return (
        <div className="space-y-8">
            
            {/* --- HÀNG 1: TOP ĐỐI TÁC --- */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-lg text-gray-800 mb-4">Top Đại lý/CTV Xuất sắc</h3>
                <div className="divide-y divide-gray-100">
                    {loading ? <p className="text-center py-4 text-gray-500">Đang tải...</p> : 
                     stats.top_partners?.length > 0 ? stats.top_partners.map((partner, index) => (
                        <TopAgentCard key={index} name={partner.name} sales={partner.revenue} orders={partner.orders} />
                    )) : <p className="text-center py-4 text-gray-500">Chưa có dữ liệu.</p>}
                </div>
            </div>

  {/* --- HÀNG 2: THẺ THỐNG KÊ (Đã cập nhật logic) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* 1. Tổng đơn hàng -> Chuyển sang trang Đơn hàng */}
                <div 
                    className={clickableCardClass}
                    onClick={() => navigate('/admin/orders')}
                >
                    <StatCard 
                        icon={<LuPackage size={24}/>} 
                        title="Tổng đơn hàng (Tháng này)" 
                        value={formatNumber(cards.total_orders?.value)} 
                        growth={cards.total_orders?.growth} 
                    />
                </div>

                {/* 2. Tổng doanh thu -> Chuyển sang trang Đơn hàng */}
                <div 
                    className={clickableCardClass}
                    onClick={() => navigate('/admin/orders')}
                >
                    <StatCard 
                        icon={<LuChartBar size={24}/>} 
                        title="Tổng doanh thu (Tháng này)" 
                        value={formatMoney(cards.total_revenue?.value)} 
                        growth={cards.total_revenue?.growth} 
                    />
                </div>

                {/* 3. Đơn chờ xử lý -> Chuyển sang trang Đơn hàng + Lọc "Chờ xử lý" */}
                <div 
                    className={clickableCardClass}
                    onClick={() => {
                        // Gửi kèm state để bên kia biết mà lọc
                        navigate('/admin/orders', { 
                            state: { autoFilterStatus: 'pending' } 
                        });
                    }}
                >
                    <StatCard 
                        icon={<LuCopy size={24}/>} 
                        title="Đơn chờ xử lý" 
                        value={formatNumber(cards.pending_orders?.value)} 
                        subText="Bấm để xử lý ngay" 
                    />
                </div>

                {/* 4. Tài khoản chờ duyệt (Code cũ của bạn - Giữ nguyên) */}
                <div 
                    className={clickableCardClass}
                    onClick={() => {
                        navigate('/admin/accounts', { 
                            state: { autoFilterStatus: 'Đang chờ cấp tài khoản' } 
                        });
                    }}
                >
                    <StatCard 
                        icon={<LuUserPlus size={24}/>} 
                        title="Tài khoản chờ duyệt" 
                        value={formatNumber(cards.new_customers?.value)} 
                        subText="Cần kích hoạt"
                    />
                </div>
            </div>
            {/* --- HÀNG 3: BIỂU ĐỒ --- */}
            <div className="grid grid-cols-1 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative">
                    
                    {/* Header Biểu đồ & Dropdown */}
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-gray-800">
                            Đơn hàng phát sinh ({new Date().getFullYear()})
                        </h3>
                        
                        {/* Dropdown chọn kiểu xem */}
                        <select 
                            className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-3 py-2 outline-none font-medium cursor-pointer hover:bg-gray-50 transition-colors"
                            value={groupBy}
                            onChange={(e) => setGroupBy(e.target.value)}
                        >
                            <option value="year">Năm nay (Theo tháng)</option>
                            <option value="week">Tuần này (Theo ngày)</option>
                        </select>
                    </div>
                    
                    {/* Vùng vẽ biểu đồ */}
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <LineChart data={stats.monthly_stats || []} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5}/>
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 12, fill: '#9CA3AF' }} 
                                    dy={10}
                                    // Nếu xem theo tuần (số lượng điểm nhiều), giãn label ra
                                    interval={groupBy === 'week' ? 0 : 0} 
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 12, fill: '#9CA3AF' }} 
                                    allowDecimals={false} 
                                />
                                <Tooltip 
                                    contentStyle={{backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff'}}
                                    itemStyle={{color: '#fff'}}
                                    formatter={(value, name) => [value, name === "Cancelled" ? "Đã hủy" : "Hoàn thành"]}
                                />
                                <Legend 
                                    verticalAlign="bottom" 
                                    height={36} 
                                    iconType="circle"
                                />
                                
                                {/* Line 1: Đã thanh toán (Hoàn thành) - Màu Xanh Ngọc */}
                                <Line 
                                    type="monotone" 
                                    dataKey="Approved" 
                                    name="Hoàn thành" 
                                    stroke="#4FD1C5" 
                                    strokeWidth={3} 
                                    dot={{ r: 4, fill: '#ffffff', strokeWidth: 2, stroke: '#4FD1C5' }} 
                                    activeDot={{ r: 6 }} 
                                />
                                
                                {/* Line 2: Đã hủy - Màu Đỏ */}
                                <Line 
                                    type="monotone" 
                                    dataKey="Cancelled" 
                                    name="Đã hủy" 
                                    stroke="#F56565" 
                                    strokeWidth={3} 
                                    dot={{ r: 4, fill: '#ffffff', strokeWidth: 2, stroke: '#F56565' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;