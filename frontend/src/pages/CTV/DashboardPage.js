// src/pages/CTV/DashboardPage.js
import React from 'react';
import StatCard from '../../components/Dashboard/StatCard';
import { LuShoppingBag, LuDollarSign, LuUsers, LuFileText } from 'react-icons/lu';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Dữ liệu mẫu cho biểu đồ
const data = [
  { name: 'Tháng 1', "Doanh số": 4000, "Hoa hồng": 240 },
  { name: 'Tháng 2', "Doanh số": 3000, "Hoa hồng": 139 },
  { name: 'Tháng 3', "Doanh số": 2000, "Hoa hồng": 980 },
  { name: 'Tháng 4', "Doanh số": 2780, "Hoa hồng": 390 },
  { name: 'Tháng 5', "Doanh số": 1890, "Hoa hồng": 480 },
  { name: 'Tháng 6', "Doanh số": 2390, "Hoa hồng": 380 },
];

const DashboardPage = () => {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 dark:text-white">Bảng điều khiển CTV</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng đơn hàng"
          value="1,250"
          change="1.5%"
          icon={<LuShoppingBag className="text-blue-500" />}
          bgColor="bg-blue-50"
          textColor="text-blue-600"
        />
        <StatCard
          title="Tổng doanh số"
          value="150,000K"
          change="2.1%"
          icon={<LuFileText className="text-orange-500" />}
          bgColor="bg-orange-50"
          textColor="text-orange-600"
        />
        <StatCard
          title="Hoa hồng tháng này"
          value="1,500K"
          change="0.8%"
          icon={<LuDollarSign className="text-green-500" />}
          bgColor="bg-green-50"
          textColor="text-green-600"
        />
        <StatCard
          title="Khách hàng"
          value="89"
          change="5 mới"
          icon={<LuUsers className="text-purple-500" />}
          bgColor="bg-purple-50"
          textColor="text-purple-600"
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mt-8 dark:bg-gray-800 dark:border dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 dark:text-white">Thống kê doanh số và hoa hồng</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Doanh số" stroke="#3B82F6" strokeWidth={2} />
            <Line type="monotone" dataKey="Hoa hồng" stroke="#10B981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardPage;