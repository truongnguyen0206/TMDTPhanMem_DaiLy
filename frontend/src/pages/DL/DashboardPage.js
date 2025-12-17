import React, { useEffect, useState } from 'react';
import StatCard from '../../components/Dashboard/StatCard'; // Import StatCard đã cập nhật
import { useOutletContext } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { LuArrowUpRight, LuArrowDownRight, LuDownload } from 'react-icons/lu';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import axiosClient from '../../api/axiosClient'; // 1. Import axiosClient
import { useAuth } from '../../context/AuthContext';
import { connectSocket } from '../../realtime/socketClient';

// Dữ liệu giả lập (giữ nguyên)
const lineChartData = [
  { name: '2015', "dataKey1": 32, "dataKey2": 40 }, // Sử dụng key trung gian
  { name: '2016', "dataKey1": 35, "dataKey2": 28 },
  { name: '2017', "dataKey1": 48, "dataKey2": 38 },
  { name: '2018', "dataKey1": 35, "dataKey2": 50 },
  { name: '2019', "dataKey1": 45, "dataKey2": 30 },
  { name: '2020', "dataKey1": 55, "dataKey2": 42 },
];
const barChartData = [
  { name: '01', value: 50 }, { name: '02', value: 25 }, { name: '03', value: 60 },
  { name: '04', value: 30 }, { name: '05', value: 70 },
];
const areaChartData = [
    { name: '2015', value: 200000 }, { name: '2016', value: 300000 },
    { name: '2017', value: 600000 }, { name: '2018', value: 750000 },
    { name: '2019', value: 500000 }, { name: '2020', value: 650000 },
];

const DashboardPage = () => {
    const { setPageTitle } = useOutletContext();
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const [ctvCount, setCtvCount] = useState(0); 
    const [orderCount, setOrderCount] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [agentId, setAgentId] = useState(null);
    const [chartFilter, setChartFilter] = useState('week');
    const [allOrders, setAllOrders] = useState([]);
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        setPageTitle(t('sidebar.dashboard'));
    }, [setPageTitle, t, i18n.language]);

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
                console.error("Lỗi lấy thông tin đại lý:", error);
            }
        };
        fetchAgentId();
    }, [user]);

    // Hàm load dữ liệu dashboard (dùng cho both: load lần đầu + realtime refresh)
    const fetchDashboardData = async () => {
        if (!agentId) return;
        try {
            const ctvRes = await axiosClient.get(`/agent/getctv/${agentId}`);
            setCtvCount(ctvRes.data.ctvList?.length || 0);

            const [ownOrdersRes, ctvOrdersRes] = await Promise.all([
                axiosClient.get(`/agent/${agentId}/orders`),
                axiosClient.get(`/agent/${agentId}/ctv-orders`)
            ]);

            const mergedOrders = [...(ownOrdersRes.data.data || []), ...(ctvOrdersRes.data.data || [])];
            setAllOrders(mergedOrders);

            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            const successKeywords = ['paid', 'completed', 'thành công', 'đã hoàn thành', 'đã thanh toán', 'success'];

            const filteredOrders = mergedOrders.filter(order => {
                const status = String(order.order_status || order.payment_status || '').toLowerCase();
                const isCompleted = successKeywords.some(k => status.includes(k));
                const dateStr = order.tao_vao_luc || order.order_date;
                if (!dateStr) return false;
                const orderDate = new Date(dateStr);
                const isThisMonth = orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
                return isCompleted && isThisMonth;
            });

            setOrderCount(filteredOrders.length);
            const total = filteredOrders.reduce((sum, order) => sum + (Number(order.total_amount) || Number(order.tong_tien) || 0), 0);
            setTotalRevenue(total);
        } catch (error) {
            console.error("Lỗi lấy dữ liệu Dashboard:", error);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [agentId]);

    // 🔥 Realtime: backend báo có thay đổi -> tự reload dashboard
    useEffect(() => {
        if (!agentId) return;
        const token = localStorage.getItem('token');
        if (!token) return;

        const socket = connectSocket();

        const onInvalidate = (payload) => {
            // Chỉ cần có signal là refresh lại
            if (!payload || payload.entity === 'order' || payload.entity === 'user') {
                fetchDashboardData();
            }
        };

        socket.on('dashboard:invalidate', onInvalidate);

        return () => {
            socket.off('dashboard:invalidate', onInvalidate);
        };
    }, [agentId]);

    useEffect(() => {
        if (allOrders.length === 0) {
            setChartData([]);
            return;
        }
        const processData = () => {
            const now = new Date();
            let dataMap = {};
            let labels = [];

            if (chartFilter === 'week') {
                const currentDay = now.getDay();
                const diffToMon = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
                const monday = new Date(now.setDate(diffToMon));
               for (let i = 0; i < 7; i++) {
                    const d = new Date(monday);
                    d.setDate(monday.getDate() + i);
                    const key = d.toLocaleDateString('vi-VN');
                    const label = i === 6 ? 'CN' : `Thứ ${i + 2}`;
                    dataMap[key] = { name: label, "Đã thanh toán": 0, "Đã hủy": 0 };
                }
            } else {
                const year = now.getFullYear();
                for (let i = 0; i < 12; i++) {
                    const key = `${i + 1}/${year}`;
                    const label = `T${i + 1}`;
                    dataMap[key] = { name: label, "Đã thanh toán": 0, "Đã hủy": 0 };
                }
            }
            allOrders.forEach(order => {
                const dateStr = order.tao_vao_luc || order.order_date;
                if (!dateStr) return;
                const orderDate = new Date(dateStr);
                let mapKey = '';

                if (chartFilter === 'week') {
                    mapKey = orderDate.toLocaleDateString('vi-VN');
                } else {
                    mapKey = `${orderDate.getMonth() + 1}/${orderDate.getFullYear()}`;
                }

                if (dataMap[mapKey]) {
                    const status = String(order.order_status || order.payment_status).toLowerCase();
                    if (['paid', 'completed', 'thành công', 'đã thanh toán', 'đã hoàn thành'].some(k => status.includes(k))) {
                        dataMap[mapKey]["Đã thanh toán"] += 1;
                    } else if (['cancelled', 'đã hủy', 'failed', 'thất bại'].some(k => status.includes(k))) {
                        dataMap[mapKey]["Đã hủy"] += 1;
                    }
                }
            });
            setChartData(Object.values(dataMap));
        };
        processData();
    }, [allOrders, chartFilter]);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title={t('sidebar.ctv')} value={ctvCount}>
                     <ResponsiveContainer width="100%" height="100%">
                         <LineChart data={[{uv: 10}, {uv: 25}, {uv: 15}, {uv: 40}, {uv: 30}, {uv: 50}]}>
                            <Line type="monotone" dataKey="uv" stroke="#3B82F6" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </StatCard>
                <StatCard title='Đơn hàng hoàng thành (Tháng này)' value={orderCount.toLocaleString()}>
                    <ResponsiveContainer width="100%" height="100%">
                         <LineChart data={[{uv: 30}, {uv: 20}, {uv: 50}, {uv: 40}, {uv: 60}, {uv: 55}]}>
                            <Line type="monotone" dataKey="uv" stroke="#3B82F6" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </StatCard>
                <StatCard 
                    title="Tổng doanh thu hóa đơn (Tháng này)"
                    value={formatCurrency(totalRevenue)}
                    change=""
                    changeType="positive" 
                    bgColorClass="bg-blue-600 text-white"
                >
                    <div className="flex items-center justify-center h-full">
                        <LuArrowUpRight size={32} className="opacity-50" />
                    </div>
                </StatCard>
                <StatCard title="Tổng doanh thu hoa hồng (Tháng này)" value="3,953,000đ" change="+5%" changeType="positive" bgColorClass="bg-green-500 text-white">
                     <div className="flex items-center justify-center h-full">
                        <LuArrowDownRight size={32} className="opacity-50" />
                    </div>
                </StatCard>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg dark:text-white">{t('npp.dashboard.ordersByYear')}</h3>
                    
                    {/* Dropdown chọn bộ lọc */}
                    <select 
                        value={chartFilter}
                        onChange={(e) => setChartFilter(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    >
                        <option value="week">Tuần này</option>
                        <option value="month">Năm nay (Theo tháng)</option>
                    </select>
                </div>

                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        {/* Truyền dữ liệu đã xử lý (chartData) vào biểu đồ */}
                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#4B5563" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} allowDecimals={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} itemStyle={{ color: '#E5E7EB' }}/>
                            <Legend wrapperStyle={{ color: '#9CA3AF' }}/>
                            
                            {/* Line 1: Đã thanh toán */}
                            <Line type="monotone" dataKey="Đã thanh toán" name="Đã thanh toán" stroke="#8884d8" strokeWidth={3} activeDot={{ r: 8 }} />
                            
                            {/* Line 2: Đã hủy */}
                            <Line type="monotone" dataKey="Đã hủy" name="Đã hủy" stroke="#F87171" strokeWidth={3} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
                    <h3 className="font-bold text-lg dark:text-white">{t('npp.dashboard.yourBalance')}</h3>
                    <p className="text-3xl font-bold mt-2 dark:text-white">5,244,000đ</p>
                    <p className="text-sm text-green-500">{t('npp.dashboard.balanceChange', { percent: '2.7' })}</p>
                    <div style={{ width: '100%', height: 150, marginTop: '1rem' }}>
                         <ResponsiveContainer>
                            <BarChart data={barChartData}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                                <Bar dataKey="value" fill="#34D399" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg dark:text-white">{t('npp.dashboard.revenueByYear')}</h3>
                        <button className="flex items-center gap-2 bg-blue-100 text-blue-600 font-semibold px-4 py-2 rounded-lg hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800">
                           <LuDownload size={16} />
                           {t('npp.dashboard.downloadCSV')}
                        </button>
                    </div>
                     <div style={{ width: '100%', height: 250 }}>
                         <ResponsiveContainer>
                            <AreaChart data={areaChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#4B5563" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }}/>
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }}/>
                                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} itemStyle={{ color: '#E5E7EB' }}/>
                                <Area type="monotone" dataKey="value" stroke="#4F46E5" fill="#C7D2FE" fillOpacity={0.3} strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;