import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { LuPencil } from 'react-icons/lu';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

// --- DỮ LIỆU MẪU ---
const mockOrders = [
    { id: 64277, type: 'Lấy nhiễm 2', customer: 'Phạm Đăng An', source: 'ctv', billId: '017042', agent: 'Đại lý VIP', date: '01/08/2025', time: '2:53PM' },
    { id: 64277, type: 'Lấy nhiễm 2', customer: 'Phạm Đăng An', source: 'dai-ly', billId: '017042', agent: 'Đại lý VIP', date: '01/08/2025', time: '2:53PM' },
    { id: 64277, type: 'Lấy nhiễm 2', customer: 'Phạm Đăng An', source: 'khach-hang', billId: '017042', agent: 'Đại lý VIP', date: '01/08/2025', time: '2:53PM' },
    { id: 64277, type: 'Lấy nhiễm 2', customer: 'Phạm Đăng An', source: 'ctv', billId: '017042', agent: 'Đại lý VIP', date: '01/08/2025', time: '2:53PM' },
    { id: 64277, type: 'Lấy nhiễm 2', customer: 'Phạm Đăng An', source: 'dai-ly', billId: '017042', agent: 'Đại lý VIP', date: '01/08/2025', time: '2:53PM' },
];

const weeklyCommissionData = [
  { name: 'Mon', value: 12000, color: '#FECACA' }, { name: 'Tue', value: 20000, color: '#FECACA' },
  { name: 'Wed', value: 15000, color: '#FECACA' }, { name: 'Thu', value: 27000, color: '#F87171' },
  { name: 'Fri', value: 18000, color: '#FECACA' }, { name: 'Sat', value: 23000, color: '#FECACA' },
  { name: 'Sun', value: 30000, color: '#FECACA' },
];


// --- CÁC COMPONENT CON ---
const StatCard = ({ title, value, unit }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-200 text-center shadow-sm">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value} <span className="text-lg font-medium">{unit}</span></p>
    </div>
);

const SourceBadge = ({ source }) => {
    const styles = {
        ctv: { text: 'Cộng tác viên', color: 'bg-yellow-100 text-yellow-800' },
        'dai-ly': { text: 'Đại lý', color: 'bg-blue-100 text-blue-800' },
        'khach-hang': { text: 'Khách hàng', color: 'bg-green-100 text-green-800' },
    };
    const style = styles[source] || {};
    return <span className={`px-3 py-1 text-xs font-bold rounded-full ${style.color}`}>{style.text}</span>;
};


// --- COMPONENT CHÍNH ---
const OrdersPage = () => {
    const { setPageTitle } = useOutletContext();
    const [orders, setOrders] = useState(mockOrders);
    
    useEffect(() => {
        setPageTitle('Đơn hàng');
    }, [setPageTitle]);

    return (
        <div className="space-y-6">
            {/* Thẻ thống kê */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard title="ĐH đang xử lý" value="24" />
                <StatCard title="Đơn Kí gửi TC" value="8" />
                <StatCard title="Đơn qua đối tác" value="12" />
                <StatCard title="Đơn qua CTV" value="4" />
                <StatCard title="Đơn bị hoàn" value="2" />
                <StatCard title="Tổng doanh thu" value="15.000đ" />
            </div>

            {/* Bảng dữ liệu */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Danh sách đơn hàng được phân phối</h3>
                    <input type="text" placeholder="Search by mã sản phẩm" className="w-72 bg-gray-50 border border-gray-200 rounded-lg py-2 px-4 focus:outline-none"/>
                </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        {/* ... thead ... */}
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">ID</th>
                                <th className="px-6 py-3">Loại đơn hàng</th>
                                <th className="px-6 py-3">Tên Khách hàng</th>
                                <th className="px-6 py-3">Nguồn phát sinh</th>
                                <th className="px-6 py-3">Mã Bill</th>
                                <th className="px-6 py-3">Đại lý/CTV</th>
                                <th className="px-6 py-3">Ngày tạo</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order, index) => (
                                <tr key={index} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium">{order.id}</td>
                                    <td className="px-6 py-4">{order.type}</td>
                                    <td className="px-6 py-4 font-semibold">{order.customer}</td>
                                    <td className="px-6 py-4"><SourceBadge source={order.source} /></td>
                                    <td className="px-6 py-4">{order.billId}</td>
                                    <td className="px-6 py-4">{order.agent}</td>
                                    <td className="px-6 py-4">{order.date} <span className="text-gray-400">{order.time}</span></td>
                                    <td className="px-6 py-4 text-center">
                                        <button className="text-gray-400 hover:text-blue-600"><LuPencil size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Khu vực phân tích */}
            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Phân tích</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Card 1: Phân tích đơn hàng */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                        <h4 className="font-bold mb-4">Đơn hàng theo kênh phát sinh</h4>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1"><span>Khách Hàng</span><span>1k</span></div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-red-400 h-2.5 rounded-full" style={{width: '45%'}}></div></div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1"><span>Đại Lý</span><span>12k</span></div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-red-400 h-2.5 rounded-full" style={{width: '75%'}}></div></div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1"><span>CTV</span><span>9.6k</span></div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-red-400 h-2.5 rounded-full" style={{width: '60%'}}></div></div>
                            </div>
                        </div>
                    </div>
                    {/* Card 2: Top CTV/Đại lý */}
                     <div className="bg-white p-6 rounded-xl border border-gray-200">
                        <h4 className="font-bold mb-4">Top CTV/Đại lý hôm nay</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm"><p>Đại lý A</p><button className="text-blue-600 font-semibold">Xem</button></div>
                            <div className="flex justify-between items-center text-sm"><p>Đại lý B</p><button className="text-blue-600 font-semibold">Xem</button></div>
                            <div className="flex justify-between items-center text-sm"><p>Đại lý C</p><button className="text-blue-600 font-semibold">Xem</button></div>
                        </div>
                    </div>
                    {/* Card 3: Hoa hồng theo tuần */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                        <h4 className="font-bold mb-4">Hoa hồng theo tuần</h4>
                         <div style={{ width: '100%', height: 150 }}>
                            <ResponsiveContainer>
                                <BarChart data={weeklyCommissionData} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} interval={0} />
                                    <Bar dataKey="value" barSize={10} radius={[0, 10, 10, 0]}>
                                        {weeklyCommissionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-between items-center mt-2 border-t pt-2">
                            <span className="text-sm font-semibold">Tổng tuần</span>
                            <span className="font-bold">151.134 VND</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrdersPage;