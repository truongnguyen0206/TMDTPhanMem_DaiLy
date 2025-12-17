import { useState } from 'react';
import { LuCircleCheck, LuX, LuCircleAlert, LuSave } from 'react-icons/lu';

const OrderStatusModal = ({ order, onClose, onUpdate }) => {
    const [status, setStatus] = useState(order.trang_thai_don_hang);
    const [paymentStatus, setPaymentStatus] = useState(order.trang_thai_thanh_toan); // Thêm state này
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Danh sách trạng thái đơn hàng (Sản phẩm số)
    const orderStatusOptions = [
        { value: 'Chờ xử lý', label: 'Chờ xử lý (Mới)' },
        { value: 'Đã xác nhận', label: 'Đã xác nhận (Đang tạo key)' },
        { value: 'Đã hoàn thành', label: 'Đã hoàn thành (Đã gửi key)' },
        { value: 'Đã hủy', label: 'Đã hủy' }
    ];

    // Danh sách trạng thái thanh toán
    const paymentStatusOptions = [
        { value: 'Chờ thanh toán', label: 'Chờ thanh toán' },
        { value: 'Đã thanh toán', label: 'Đã thanh toán' },
        { value: 'Đã hoàn tiền', label: 'Đã hoàn tiền' }
    ];

    const handleSubmit = async () => {
        setIsSubmitting(true);
        // Truyền cả 2 trạng thái xuống
        // Lưu ý: Logic gọi API ở OrdersPage.js cần sửa để nhận object { status, payment_status }
        await onUpdate(order.order_id, { 
            order_status: status, 
            payment_status: paymentStatus,
            note: note 
        });
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="flex justify-between items-center p-5 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <LuCircleCheck className="text-blue-600" /> Cập nhật đơn hàng
                    </h3>
                    <button onClick={onClose}><LuX size={24} className="text-gray-400 hover:text-gray-600" /></button>
                </div>

                <div className="p-6 space-y-4">
                    {/* Chọn trạng thái Đơn hàng */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái xử lý</label>
                        <select className="w-full border p-2 rounded-lg" value={status} onChange={(e) => setStatus(e.target.value)}>
                            {orderStatusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>

                    {/* Chọn trạng thái Thanh toán */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái thanh toán</label>
                        <select className="w-full border p-2 rounded-lg" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
                            {paymentStatusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>

                    {/* Cảnh báo nhẹ */}
                    {status === 'Hoàn thành' && paymentStatus !== 'Đã thanh toán' && (
                        <div className="flex gap-2 p-3 bg-yellow-50 text-yellow-700 rounded-lg text-xs items-start">
                            <LuCircleAlert size={16} className="mt-0.5 shrink-0" />
                            <span>Lưu ý: Bạn đang để đơn hàng "Hoàn thành" nhưng chưa "Đã thanh toán". Hãy kiểm tra kỹ tiền về chưa.</span>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                        <textarea className="w-full border p-2 rounded-lg text-sm" rows="3" placeholder="Nhập ghi chú..." value={note} onChange={(e) => setNote(e.target.value)}></textarea>
                    </div>
                </div>

                <div className="p-5 border-t bg-gray-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 border rounded-lg bg-white">Hủy</button>
                    <button onClick={handleSubmit} disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2">
                        {isSubmitting ? 'Đang lưu...' : <><LuSave /> Lưu thay đổi</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderStatusModal;