import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { FaSearch, FaBell, FaShoppingCart, FaChartLine, FaClipboardList, FaUsers, FaEllipsisV } from 'react-icons/fa';

// --- Components Con ---

// Thẻ thống kê
const StatCard = ({ icon, title, value, change, changeType, iconBgColor }) => (
  <div className="bg-white p-5 rounded-xl shadow-md flex flex-col justify-between">
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-lg ${iconBgColor}`}>
        {icon}
      </div>
      <p className={`font-semibold ${changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
        {changeType === 'increase' ? '+' : ''}{change}
      </p>
    </div>
    <div>
      <h3 className="text-2xl font-bold text-gray-800 mt-2">{value}</h3>
      <p className="text-sm text-gray-500">{title}</p>
    </div> 
  </div>
);

// Dòng trong bảng Top Đại lý/CTV
const TopPerformerRow = ({ name, revenue, orders, rank }) => (
  <div className="grid grid-cols-12 items-center py-3 px-4 hover:bg-gray-50 rounded-lg">
    <p className="col-span-4 font-semibold text-gray-700">{name}</p>
    <p className="col-span-3 font-semibold text-gray-800">{revenue}</p>
    <p className="col-span-2 text-gray-500">{orders}</p>
    <p className="col-span-2 text-yellow-500 font-semibold">{rank}</p>
    <div className="col-span-1 text-right text-gray-400 cursor-pointer">
      <FaEllipsisV />
    </div>
  </div>
);

// --- Component Chính ---

const DashboardPage = () => {
  // Dữ liệu mẫu cho biểu đồ
  const chartData = [
    { name: '2015', Approved: 30, Submitted: 22 },
    { name: '2016', Approved: 25, Submitted: 35 },
    { name: '2017', Approved: 45, Submitted: 32 },
    { name: '2018', Approved: 28, Submitted: 35 },
    { name: '2019', Approved: 50, Submitted: 30 },
    { name: '2020', Approved: 35, Submitted: 45 },
    { name: '2021', Approved: 60, Submitted: 50 },
    { name: '2022', Approved: 55, Submitted: 60 },
    { name: '2023', Approved: 70, Submitted: 65 },
    { name: '2024', Approved: 80, Submitted: 70 },
    { name: '2025', Approved: 90, Submitted: 75 },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen font-sans">
        <div className=" space-y-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          {/* Top Đại lý / CTV */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Top Đại lý/CTV</h2>
            <div className="space-y-2">
              <TopPerformerRow name="Đại lý A" revenue="10.000.000 VNĐ" orders="150 Đơn" rank="+Gold" />
              <TopPerformerRow name="CTV B" revenue="9.000.000 VNĐ" orders="100 Đơn" rank="+Silver" />
              <TopPerformerRow name="Nhân viên C" revenue="5.000.000 VNĐ" orders="50 Đơn" rank="+Silver" />
              <TopPerformerRow name="Đại lý D" revenue="2.000.000 VNĐ" orders="20 Đơn" rank="+Gold" />
            </div>
          </div>

          {/* 4 Thẻ thống kê */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={<FaShoppingCart />} title="Tổng số đơn hàng phát sinh" value="25.1k" change="+15%" changeType="increase" iconBgColor="bg-blue-100 text-blue-600" />
            <StatCard icon={<FaChartLine />} title="Tổng doanh thu hệ thống" value="2,435k VNĐ" change="-3.5%" changeType="decrease" iconBgColor="bg-red-100 text-red-600" />
            <StatCard icon={<FaClipboardList />} title="Tổng hoa hồng đã ghi nhận" value="3.5M" change="+15%" changeType="increase" iconBgColor="bg-green-100 text-green-600" />
            <StatCard icon={<FaUsers />} title="Khách hàng mới" value="43.5k" change="+10%" changeType="increase" iconBgColor="bg-yellow-100 text-yellow-600" />
          </div>

          {/* Biểu đồ đơn hàng */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Đơn hàng phát sinh theo năm</h2>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="Approved" stackId="1" stroke="#8884d8" fill="#8884d8" />
                  <Area type="monotone" dataKey="Submitted" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
    </div>
  );
}; 

export default DashboardPage;