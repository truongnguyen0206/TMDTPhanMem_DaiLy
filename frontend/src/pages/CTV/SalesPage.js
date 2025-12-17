// src/pages/CTV/SalesPage.js
import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

// Component cho các thẻ thống kê
const StatCard = ({ title, value }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
);

// Component cho trạng thái
const StatusBadge = ({ status }) => {
    let style = { text: status || 'N/A', color: 'bg-gray-100 text-gray-600' };
    const s = String(status).toLowerCase();

    if (s.includes('hoàn thành') || s.includes('success') || s.includes('active')) {
        style = { text: 'Thành công', color: 'bg-green-100 text-green-800' };
    } else if (s.includes('hủy') || s.includes('inactive') || s.includes('fail')) {
        style = { text: 'Đã hủy', color: 'bg-red-100 text-red-800' };
    } else if (s.includes('chờ') || s.includes('pending')) {
        style = { text: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800' };
    }

    return (
        <span className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${style.color}`}>
            {style.text}
        </span>
    );
};

// Hàm format tiền tệ
const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
};

// Hàm format ngày tháng
const formatDate = (dateString) => {
    if (!dateString) return '---';
    try {
        return new Date(dateString).toLocaleDateString('vi-VN');
    } catch (e) {
        return dateString;
    }
};

const SalesPage = () => {
    const { setPageTitle } = useOutletContext();
    const { user } = useAuth(); // Lấy thông tin user (CTV) từ context

    const [salesData, setSalesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        setPageTitle('Doanh số & mã giới thiệu');
        fetchSalesData();
    }, [setPageTitle, user]);

    const fetchSalesData = async () => {
        if (!user || !user.id) return;

        try {
            setLoading(true);
            // Gọi API lấy đơn hàng theo user_id của CTV
            const response = await axiosClient.get('/order/byUser', {
                params: { 
                    user_id: user.id, // Lấy ID từ token đã decode
                    role_id: user.role_id // Gửi thêm role nếu BE cần lọc kỹ hơn
                }
            });

            if (response.data && response.data.data) {
                // Mapping dữ liệu từ BE (snake_case) sang FE (camelCase/custom)
                // Lưu ý: Trường hoa hồng (commission) nếu chưa có trong bảng orders_view thì tạm tính hoặc để 0
                const mappedData = response.data.data.map(order => ({
                    id: order.referral_code || '---',      // Mã giới thiệu
                    orderCode: order.ma_don_hang || order.order_code, // Mã đơn hàng (để hiển thị nếu không có mã ref)
                    user: order.customer_name || `Khách hàng (ID: ${order.customer_id})`, // Tên khách
                    email: order.customer_email || '---',  // Email khách
                    date: order.created_at || order.order_date, // Ngày tạo
                    sales: Number(order.total_amount || 0), // Doanh số
                    status: order.order_status || order.trang_thai_don_hang, // Trạng thái
                    // Tạm tính hoa hồng: Ví dụ 10% nếu chưa có trường thực tế từ API
                    commission: Number(order.commission_amount || (order.total_amount * 0.1)) 
                }));
                setSalesData(mappedData);
            }
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu doanh số:", error);
            // Có thể hiển thị thông báo lỗi nhẹ ở đây nếu cần
        } finally {
            setLoading(false);
        }
    };

    // --- Tính toán thống kê (Real-time từ dữ liệu tải về) ---
    const totalSales = salesData.reduce((sum, item) => sum + item.sales, 0);
    const totalCommission = salesData.reduce((sum, item) => sum + item.commission, 0);
    const activeCodesCount = new Set(salesData.map(item => item.id).filter(id => id !== '---')).size;

    // --- Phân trang ---
    const totalPages = Math.ceil(salesData.length / itemsPerPage);
    const currentData = salesData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const renderPagination = () => {
        if (totalPages <= 1) return null;
        let pages = [];
        for (let i = 1; i <= Math.min(totalPages, 5); i++) {
            pages.push(
                <button 
                    key={i} 
                    onClick={() => setCurrentPage(i)} 
                    className={`px-3 py-1 rounded-md ${currentPage === i ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border'}`}
                >
                    {i}
                </button>
            );
        }
        return pages;
    };

    return (
        <div className="space-y-6">
            {/* Thẻ thống kê (Dữ liệu thật) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <StatCard title="Tổng số đơn hàng" value={salesData.length} />
                 <StatCard title="Mã đã sử dụng" value={activeCodesCount} />
                 <StatCard title="Tổng Doanh thu" value={formatCurrency(totalSales)} />
                 <StatCard title="Tổng Hoa Hồng (Ước tính)" value={formatCurrency(totalCommission)} />
            </div>

            {/* Bảng dữ liệu */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3">Mã giới thiệu</th>
                                <th className="px-6 py-3">Mã đơn</th>
                                <th className="px-6 py-3">Khách hàng</th>
                                <th className="px-6 py-3">Ngày tạo</th>
                                <th className="px-6 py-3">Doanh số</th>
                                <th className="px-6 py-3 text-center">Trạng thái</th>
                                <th className="px-6 py-3 text-right">Hoa hồng</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-8 text-gray-500">
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : currentData.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-8 text-gray-500">
                                        Chưa có đơn hàng nào. Hãy chia sẻ link giới thiệu để bắt đầu!
                                    </td>
                                </tr>
                            ) : (
                                currentData.map((item, index) => (
                                    <tr key={index} className="bg-white border-b hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-blue-600">{item.id}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{item.orderCode}</td>
                                        <td className="px-6 py-4">
                                            <p className="text-gray-800">{item.user}</p>
                                            <p className="text-xs text-gray-400">{item.email}</p>
                                        </td>
                                        <td className="px-6 py-4">{formatDate(item.date)}</td>
                                        <td className="px-6 py-4 font-medium">{formatCurrency(item.sales)}</td>
                                        <td className="px-6 py-4 text-center"><StatusBadge status={item.status} /></td>
                                        <td className="px-6 py-4 text-right font-bold text-green-600">{formatCurrency(item.commission)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                 {/* Phân trang */}
                {!loading && salesData.length > 0 && (
                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                            Hiển thị {currentData.length} trên tổng số {salesData.length} kết quả
                        </p>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 border disabled:opacity-50"
                            >
                                {'<'}
                            </button>
                            {renderPagination()}
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 border disabled:opacity-50"
                            >
                                {'>'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalesPage;