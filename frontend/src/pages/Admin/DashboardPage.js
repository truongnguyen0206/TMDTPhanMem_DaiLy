import React, { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { LuEllipsisVertical, LuTrendingUp, LuTrendingDown, LuPackage, LuUsers, LuChartBar, LuCopy, LuEye } from 'react-icons/lu';

// --- DỮ LIỆU MẪU ---
const topAgents = [
    { name: 'Đại lý A', sales: '10,000,000 VND', orders: '150 Đơn', rank: 'Gold' },
    { name: 'CTV B', sales: '9,000,000 VND', orders: '100 Đơn', rank: 'Silver' },
    { name: 'Nhân viên C', sales: '5,000,000 VND', orders: '50 Đơn', rank: 'Silver' },
    { name: 'Đại lý D', sales: '2,000,000 VND', orders: '20 Đơn', rank: 'Gold' },
];

const chartData = [
  { name: '2015', Approved: 30, Submitted: 22 },
  { name: '2016', Approved: 45, Submitted: 35 },
  { name: '2017', Approved: 40, Submitted: 50 },
  { name: '2018', Approved: 55, Submitted: 40 },
  { name: '2019', Approved: 65, Submitted: 55 },
  { name: '2020', Approved: 50, Submitted: 60 },
];


// --- CÁC COMPONENT CON ---

// Component cho mỗi dòng trong danh sách Top Đại lý
const TopAgentCard = ({ name, sales, orders, rank }) => {
    const rankColor = rank === 'Gold' ? 'text-yellow-500' : 'text-gray-400';
    return (
        <div className="grid grid-cols-10 items-center p-4">
            <p className="col-span-3 font-bold text-gray-800">{name}</p>
            <p className="col-span-2 text-gray-600 font-semibold">{sales}</p>
            <p className="col-span-2 text-gray-500">{orders}</p>
            <p className={`col-span-2 font-bold ${rankColor}`}>+{rank}</p>
            <div className="col-span-1 flex justify-end">
                <button className="text-gray-400 hover:text-gray-600">
                    <LuEllipsisVertical size={20} />
                </button>
            </div>
        </div>
    );
};

// Component cho các thẻ thống kê
const StatCard = ({ icon, title, value, change, changeType }) => {
    const isPositive = changeType === 'positive';
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
                <p className="text-gray-500 font-medium">{title}</p>
                {icon}
            </div>
            <p className="text-3xl font-bold text-gray-800 mt-4">{value}</p>
            <div className="flex items-center justify-between mt-4">
                <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {isPositive ? <LuTrendingUp size={16}/> : <LuTrendingDown size={16}/>}
                    <span>{change}</span>
                </div>
                <a href="#" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                    <LuEye size={16} />
                    <span>View Report</span>
                </a>
            </div>
        </div>
    );
};


// --- COMPONENT CHÍNH ---
const DashboardPage = () => {
    const { setPageTitle } = useOutletContext();
    
    useEffect(() => {
        setPageTitle('Dashboard');
    }, [setPageTitle]);

    return (
        <div className="space-y-8">
            {/* Top Đại lý / CTV */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="font-bold text-lg text-gray-800 mb-2">Top Đại lý/CTV</h3>
                <div className="divide-y divide-gray-100">
                    {topAgents.map((agent, index) => (
                        <TopAgentCard key={index} {...agent} />
                    ))}
                </div>
            </div>

            {/* Thẻ thống kê */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<LuPackage size={24} className="text-blue-500"/>} title="Tổng số đơn hàng phát sinh" value="25.1k" change="+15%" changeType="positive" />
                <StatCard icon={<LuChartBar size={24} className="text-blue-500"/>} title="Tổng doanh thu hệ thống" value="2,435k" change="-3.5%" changeType="negative" />
                <StatCard icon={<LuCopy size={24} className="text-blue-500"/>} title="Tổng hoa hồng đã ghi nhận" value="3.5M" change="+15%" changeType="positive" />
                <StatCard icon={<LuUsers size={24} className="text-blue-500"/>} title="Khách hàng mới" value="43.5k" change="+10%" changeType="positive" />
            </div>

            {/* Biểu đồ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200">
                    <h3 className="font-bold text-lg text-gray-800 mb-4">Đơn hàng phát sinh theo tháng</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Line type="monotone" dataKey="Approved" stroke="#8884d8" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} name="Approved" />
                                <Line type="monotone" dataKey="Submitted" stroke="#F87171" strokeWidth={3} dot={{ r: 5 }} name="Submitted" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                
                <div className="bg-indigo-600 text-white p-8 rounded-xl flex flex-col justify-between">
                    <div>
                        <p className="font-semibold text-lg opacity-90">Cleared Q-ueue</p>
                        <p className="text-5xl font-bold mt-2">1.4k</p>
                    </div>
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-sm opacity-80">No. of Bills</p>
                            <p className="font-semibold text-lg mt-1">+15%</p>
                        </div>
                        <div style={{ width: '50%', height: 60 }}>
                             <ResponsiveContainer>
                                <LineChart data={chartData.map(d => ({...d, val: d.Approved + 10}))}>
                                    <Line type="monotone" dataKey="val" stroke="white" strokeWidth={3} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;