import React from 'react';
import { LuPackage, LuUser, LuMapPin, LuCreditCard, LuX, LuDownload } from 'react-icons/lu';

// Helper format tiền
const formatCurrency = (value) => {
    if (value === null || value === undefined) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

// Component Badge Trạng thái (Tái sử dụng style)
const StatusBadge = ({ status, type }) => {
    let style = { text: status || 'N/A', color: 'bg-gray-100 text-gray-600' };
    const s = String(status).toLowerCase();
    
    if (type === 'order') {
        if (s.includes('chờ')) style = { text: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800' };
        else if (s.includes('hoàn thành')) style = { text: 'Hoàn thành', color: 'bg-green-100 text-green-800' };
        else if (s.includes('hủy')) style = { text: 'Đã hủy', color: 'bg-red-100 text-red-800' };
    } else {
        if (s === 'paid' || s.includes('đã')) style = { text: 'Đã thanh toán', color: 'bg-green-100 text-green-800' };
        else style = { text: 'Chờ thanh toán', color: 'bg-red-100 text-red-800' };
    }
    return <span className={`px-2 py-1 text-xs font-bold rounded-full whitespace-nowrap ${style.color}`}>{style.text}</span>;
};

const OrderDetailModal = ({ order, onClose }) => {
    if (!order) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <LuPackage className="text-blue-600" /> 
                            Chi tiết đơn hàng {order.ma_don_hang}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Ngày tạo: {order.tao_vao_luc ? new Date(order.tao_vao_luc).toLocaleString('vi-VN') : 'N/A'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <LuX size={24} className="text-gray-500" />
                    </button>
                </div>

                {/* Body (Scrollable) */}
                <div className="p-6 overflow-y-auto flex-1">
                    {/* Thông tin chung */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <h4 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2"><LuUser /> Khách hàng</h4>
                            <p className="text-sm text-gray-700 font-medium">{order.customer_name || 'Khách lẻ'}</p>
                            <p className="text-sm text-gray-500">{order.customer_phone || '---'}</p>
                        </div>
                                               <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                            <h4 className="text-sm font-bold text-purple-800 mb-3 flex items-center gap-2"><LuMapPin /> Nguồn đơn</h4>
                            <p className="text-sm text-gray-600">Nguồn: <span className="font-semibold text-gray-800">{order.nguon_tao_don}</span></p>
                            <p className="text-sm text-gray-600">Người tạo đơn: <span className="font-semibold text-gray-800">{order.nguoi_tao_don || 'N/A'}</span></p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                            <h4 className="text-sm font-bold text-green-800 mb-3 flex items-center gap-2"><LuCreditCard /> Trạng thái</h4>
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500">Đơn hàng:</span>
                                    <StatusBadge status={order.trang_thai_don_hang} type="order" />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500">Thanh toán:</span>
                                    <StatusBadge status={order.trang_thai_thanh_toan} type="payment" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Danh sách sản phẩm */}
                    <h3 className="font-bold text-gray-800 mb-4 border-l-4 border-blue-500 pl-3">Danh sách sản phẩm</h3>
                    <div className="border rounded-lg overflow-hidden mb-6">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 text-gray-600 font-semibold">
                                <tr>
                                    <th className="px-4 py-3">Sản phẩm</th>
                                    <th className="px-4 py-3 text-center">Đơn giá</th>
                                    <th className="px-4 py-3 text-center">Số lượng</th>
                                    <th className="px-4 py-3 text-right">Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">

<tr>
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-gray-800 text-base">{order.san_pham || 'Sản phẩm'}</p>
                                    </td>
                                    <td className="px-4 py-3 text-center">{formatCurrency(order.gia || 0)}</td>
                                    <td className="px-6 py-3 text-center font-bold bg-blue-50 text-blue-600 rounded-md inline-block my-2 mx-auto">
                                        {order.so_luong}
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium text-gray-800">
                                        {formatCurrency(order.tong_tien)}
                                    </td>
                                </tr>
                            </tbody>
                            <tfoot className="bg-gray-50">
                                <tr>
                                    <td colSpan="3" className="px-4 py-3 text-right font-bold text-gray-600">Tổng thanh toán:</td>
                                    <td className="px-4 py-3 text-right font-bold text-blue-600 text-lg">{formatCurrency(order.tong_tien)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors">
                        Đóng
                    </button>
                    {/* Nút tải hóa đơn (Demo UI) */}
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                        <LuDownload size={16} /> Xuất hóa đơn
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailModal;