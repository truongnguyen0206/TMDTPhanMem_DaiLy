import React, { useState, useEffect } from 'react';
import StatCard from '../../components/Dashboard/StatCard';
import { useOutletContext } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { LuArrowUpRight, LuArrowDownRight, LuDownload } from 'react-icons/lu';

// Dữ liệu giả lập
const lineChartData = [
  { name: '2015', "Đã thanh toán": 32, "Chờ xử lý": 40 },
  { name: '2016', "Đã thanh toán": 35, "Chờ xử lý": 28 },
  { name: '2017', "Đã thanh toán": 48, "Chờ xử lý": 38 },
  { name: '2018', "Đã thanh toán": 35, "Chờ xử lý": 50 },
  { name: '2019', "Đã thanh toán": 45, "Chờ xử lý": 30 },
  { name: '2020', "Đã thanh toán": 55, "Chờ xử lý": 42 },
];

const barChartData = [
  { name: '01', value: 50 }, { name: '02', value: 25 }, { name: '03', value: 60 },
  { name: '04', value: 30 }, { name: '05', value: 70 },
];

const areaChartData = [
    { name: '2015', value: 200000 }, { name: '2015', value: 450000 },
    { name: '2016', value: 300000 }, { name: '2017', value: 600000 },
    { name: '2018', value: 750000 }, { name: '2019', value: 500000 },
    { name: '2020', value: 650000 },
];


const DashboardPage = () => {
    // Lấy hàm setPageTitle từ context của Outlet
    const { setPageTitle } = useOutletContext();
    
        useEffect(() => {
            setPageTitle('Dashboard');
        }, [setPageTitle]);
    return (
        <div className="space-y-6">
            {/* Hàng trên: Các thẻ thông số */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Cộng tác viên" value="50">
                    <ResponsiveContainer width="100%" height="100%">
                         <LineChart data={[{uv: 10}, {uv: 25}, {uv: 15}, {uv: 40}, {uv: 30}, {uv: 50}]}>
                            <Line type="monotone" dataKey="uv" stroke="#3B82F6" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </StatCard>
                <StatCard title="Đơn hàng" value="1,565k">
                    <ResponsiveContainer width="100%" height="100%">
                         <LineChart data={[{uv: 30}, {uv: 20}, {uv: 50}, {uv: 40}, {uv: 60}, {uv: 55}]}>
                            <Line type="monotone" dataKey="uv" stroke="#3B82F6" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </StatCard>
                <StatCard title="Doanh Thu Hôm Nay" value="3,245,000đ" change="+5%" changeType="positive" bgColorClass="bg-blue-600 text-white">
                    <div className="flex items-center justify-center h-full">
                        <LuArrowUpRight size={32} className="opacity-50" />
                    </div>
                </StatCard>
                <StatCard title="Doanh Thu Hôm Qua" value="3,953,000đ" change="+5%" changeType="positive" bgColorClass="bg-green-500 text-white">
                     <div className="flex items-center justify-center h-full">
                        <LuArrowDownRight size={32} className="opacity-50" />
                    </div>
                </StatCard>
            </div>

            {/* Biểu đồ đường */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="font-bold text-lg mb-4">Đơn hàng phát sinh theo năm</h3>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <LineChart data={lineChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="Đã thanh toán" stroke="#8884d8" strokeWidth={3} activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="Chờ xử lý" stroke="#F87171" strokeWidth={3} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Hàng dưới: Biểu đồ cột và miền */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
                    <h3 className="font-bold text-lg">Số dư của bạn</h3>
                    <p className="text-3xl font-bold mt-2">5,244,000đ</p>
                    <p className="text-sm text-green-500">+2.7% then last week</p>
                    <div style={{ width: '100%', height: 150, marginTop: '1rem' }}>
                         <ResponsiveContainer>
                            <BarChart data={barChartData}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <Bar dataKey="value" fill="#34D399" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg">Doanh thu theo năm</h3>
                        <button className="flex items-center gap-2 bg-blue-100 text-blue-600 font-semibold px-4 py-2 rounded-lg hover:bg-blue-200">
                           <LuDownload size={16} />
                           Download CSV
                        </button>
                    </div>
                     <div style={{ width: '100%', height: 250 }}>
                         <ResponsiveContainer>
                            <AreaChart data={areaChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Area type="monotone" dataKey="value" stroke="#4F46E5" fill="#C7D2FE" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;