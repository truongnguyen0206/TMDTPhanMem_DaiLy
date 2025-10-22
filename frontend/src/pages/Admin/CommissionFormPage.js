import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate, useParams } from 'react-router-dom';

// mode: 'new' hoặc 'edit'
const CommissionFormPage = ({ mode }) => {
    const { setPageTitle } = useOutletContext();
    const navigate = useNavigate();
    const { id } = useParams(); // Lấy ID từ URL nếu là chế độ edit
    const isEditMode = mode === 'edit';

    const [formData, setFormData] = useState({
        code: '5217',
        product: 'V-Pharma',
        unit: '',
        percentage: '',
        startDate: '01/05/2025 2:53PM',
        endDate: '01/05/2025 2:53PM',
        notes: 'Ghi chú'
    });

    useEffect(() => {
        setPageTitle('Hoa hồng'); // Giữ tiêu đề trang chính
        if (isEditMode) {
            // Logic để tải dữ liệu hoa hồng dựa trên ID
            console.log("Đang ở chế độ chỉnh sửa cho ID:", id);
        }
    }, [setPageTitle, isEditMode, id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Dữ liệu đã lưu:", formData);
        alert(isEditMode ? 'Đã cập nhật hoa hồng!' : 'Đã tạo hoa hồng mới!');
        navigate('/admin/commission');
    };

    return (
        <div className="bg-white p-8 rounded-xl border border-gray-200 max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-gray-700 mb-6">Chi tiết hoa hồng</h2>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Hàng 1 */}
                    <div className="lg:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mã hoa hồng</label>
                        <input type="text" value={formData.code} readOnly className="w-full bg-gray-200 border-gray-300 rounded-md p-3 cursor-not-allowed" />
                    </div>
                    <div className="lg:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sản phẩm áp dụng</label>
                        <input type="text" name="product" value={formData.product} onChange={handleChange} className="w-full bg-gray-50 border-gray-300 rounded-md p-3" />
                    </div>

                    {/* Hàng 2 */}
                    <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị áp dụng</label>
                        <select name="unit" value={formData.unit} onChange={handleChange} className="w-full bg-gray-50 border-gray-300 rounded-md p-3">
                            <option value="">Chọn</option>
                            <option value="dai-ly">Đại lý</option>
                            <option value="ctv">Cộng tác viên</option>
                        </select>
                    </div>
                    <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hoa hồng (%)</label>
                         <select name="percentage" value={formData.percentage} onChange={handleChange} className="w-full bg-gray-50 border-gray-300 rounded-md p-3">
                            <option value="">Chọn</option>
                            <option value="5">5%</option>
                            <option value="10">10%</option>
                            <option value="15">15%</option>
                        </select>
                    </div>
                    
                    {/* Hàng 3 */}
                    <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
                        <input type="text" value={formData.startDate} readOnly className="w-full bg-gray-200 border-gray-300 rounded-md p-3" />
                    </div>
                     <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</label>
                        <input type="text" value={formData.endDate} readOnly className="w-full bg-gray-200 border-gray-300 rounded-md p-3" />
                    </div>

                    {/* Hàng 4 */}
                    <div className="lg:col-span-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú bổ sung (tùy chọn)</label>
                        <textarea name="notes" rows="4" value={formData.notes} onChange={handleChange} className="w-full bg-gray-50 border-gray-300 rounded-md p-3"></textarea>
                    </div>
                </div>

                <div className="flex justify-end gap-4 mt-8">
                    <button type="button" onClick={() => navigate('/admin/commission')} className="bg-red-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-600">
                        Đóng
                    </button>
                    <button type="submit" className="bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600">
                        {isEditMode ? 'Cập nhật' : 'Tạo mới'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CommissionFormPage;