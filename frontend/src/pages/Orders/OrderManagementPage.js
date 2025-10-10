import React from 'react';
import { FaSearch, FaBell, FaCalendarDay, FaUser, FaStore, FaUsers, FaTimesCircle, FaDollarSign,
     FaFilter, FaSyncAlt, FaClock, FaChartBar, FaUserFriends } from 'react-icons/fa';

// --- Components Con ---

// Component cho các thẻ thống kê ở trên cùng
const StatCard = ({ icon, title, value, colorClass }) => (
  <div className="bg-white p-4 rounded-lg shadow flex items-center">
    <div className={`p-3 rounded-full mr-4 ${colorClass.bg} ${colorClass.text}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

// --- Component Chính ---

const OrderManagementPage = () => {
  // Dữ liệu mẫu
  const stats = [
    { title: 'Đơn Hàng hôm nay', value: '24', icon: <FaCalendarDay />, color: 'blue' },
    { title: 'Đơn từ khách hàng', value: '8', icon: <FaUser />, color: 'orange' },
    { title: 'Đơn qua đại lý', value: '12', icon: <FaStore />, color: 'purple' },
    { title: 'Đơn qua CTV', value: '4', icon: <FaUsers />, color: 'green' },
    { title: 'Đơn bị hoàn', value: '2', icon: <FaTimesCircle />, color: 'gray' },
    { title: 'Tổng doanh thu', value: '15.000đ', icon: <FaDollarSign />, color: 'red' },
  ];

  const orders = [
    { id: 'ORD-001', customer: 'Khách hàng A', product: 'BHB', value: '100.000đ', status: 'Active', source: 'Đại Lý', date: '01/12/2025', action: 'ORD-001' },
    { id: 'ORD-002', customer: 'Khách hàng B', product: 'BHB', value: '100.000đ', status: 'Pending', source: 'CTV', date: '01/12/2025', action: 'ORD-002' },
    { id: 'ORD-003', customer: 'Khách hàng C', product: 'BHB', value: '100.000đ', status: 'Completed', source: 'Đại Lý', date: '01/12/2025', action: 'ORD-003' },
    { id: 'ORD-004', customer: 'Khách hàng D', product: 'BHB', value: '100.000đ', status: 'Cancelled', source: 'Khách hàng', date: '01/12/2025', action: 'ORD-004' },
  ];

  const colorClasses = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    gray: { bg: 'bg-gray-200', text: 'text-gray-600' },
    red: { bg: 'bg-red-100', text: 'text-red-600' },
  };
  
  const statusClasses = {
    Active: 'bg-green-100 text-green-700',
    Pending: 'bg-yellow-100 text-yellow-700',
    Completed: 'bg-blue-100 text-blue-700',
    Cancelled: 'bg-red-100 text-red-700',
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen font-sans">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <div className="relative w-1/3">
          <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search" className="w-full bg-white pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none" />
        </div>
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 bg-white rounded-lg border border-gray-200 flex items-center gap-2">
            <FaCalendarDay className="text-gray-500" /> Today
          </button>
        </div>
      </header>

      {/* Main Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Order Management Dashboard</h1>
        <p className="text-gray-500">Manage and track all your order in one place</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-6">
        {stats.map(stat => (
          <StatCard key={stat.title} {...stat} colorClass={colorClasses[stat.color]} />
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6 bg-white p-4 rounded-lg shadow">
        <input type="text" placeholder="dd/mm/yy" className="px-4 py-2 border rounded-lg" />
        <select className="px-4 py-2 border rounded-lg bg-white">
          <option>Trạng Thái Đơn Hàng</option>
        </select>
        <select className="px-4 py-2 border rounded-lg bg-white">
          <option>Phương Thức Thanh Toán</option>
        </select>
        <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
          <FaFilter /> Filter
        </button>
        <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <FaSyncAlt /> Reset
        </button>
      </div>

      {/* Order Table */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold mb-4">Đơn Hàng</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b">
                {['Mã Đơn', 'Khách hàng', 'Sản phẩm', 'Giá trị', 'Trạng Thái', 'Nguồn phát sinh', 'Ngày Tạo', 'Hành động'].map(h => (
                  <th key={h} className="p-3 text-sm font-semibold text-gray-600 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-sm font-medium">{order.id}</td>
                  <td className="p-3 text-sm">{order.customer}</td>
                  <td className="p-3 text-sm">{order.product}</td>
                  <td className="p-3 text-sm">{order.value}</td>
                  <td className="p-3 text-sm">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-3 text-sm">{order.source}</td>
                  <td className="p-3 text-sm">{order.date}</td>
                  <td className="p-3 text-sm">{order.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Đơn hàng theo kênh */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-bold mb-4 flex items-center gap-2"><FaClock /> Đơn hàng theo kênh phát sinh</h3>
          <div className="space-y-4 text-sm">
            <div>
              <div className="flex justify-between mb-1"><span>Khách hàng</span><span>18 Đơn</span></div>
              <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-red-500 h-2 rounded-full" style={{width: '60%'}}></div></div>
            </div>
            <div>
              <div className="flex justify-between mb-1"><span>Đại lý</span><span>12 Đơn</span></div>
              <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-red-500 h-2 rounded-full" style={{width: '40%'}}></div></div>
            </div>
            <div>
              <div className="flex justify-between mb-1"><span>CTV</span><span>8 Đơn</span></div>
              <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-red-500 h-2 rounded-full" style={{width: '27%'}}></div></div>
            </div>
          </div>
        </div>
        
        {/* Card 2: Top CTV/Đại lý */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-bold mb-4 flex items-center gap-2"><FaUserFriends /> Top CTV/ Đại lý hôm nay</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span>Đại lý A</span><span className="font-semibold text-blue-600">35%</span></div>
            <div className="flex justify-between"><span>Đại lý A</span><span className="font-semibold text-blue-600">35%</span></div>
            <div className="flex justify-between"><span>Đại lý A</span><span className="font-semibold text-blue-600">35%</span></div>
          </div>
        </div>
        
        {/* Card 3: Hoa hồng theo tuần */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-bold mb-4 flex items-center gap-2"><FaChartBar /> Hoa hồng theo tuần</h3>
          <div className="space-y-2 text-sm">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
              <div key={day} className="flex items-center">
                <span className="w-10">{day}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-4 mr-2">
                  <div className="bg-red-500 h-4 rounded-full" style={{width: `${20 + i*10}%`}}></div>
                </div>
                <span className="w-20 text-right text-gray-500">{`${(i*2.1 + 0.9).toFixed(1)}M VND`}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t flex justify-between font-bold">
            <span>Tổng Tuần</span>
            <span>101.5M VND</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderManagementPage;