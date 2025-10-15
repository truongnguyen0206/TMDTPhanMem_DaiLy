import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

// Component để hiển thị trường thông tin không chỉnh sửa
const InfoField = ({ label, value }) => (
    <div>
        <label className="block text-sm font-medium text-gray-500 mb-1">{label}</label>
        <div className="bg-gray-100 p-3 rounded-md text-gray-800 font-semibold min-h-[44px] flex items-center">
            {value}
        </div>
    </div>
);

const ProductCommissionFormPage = () => {
    const navigate = useNavigate();
    // Lấy dữ liệu sản phẩm/hoa hồng từ state (tương tự như trang PayCommissionPage)
    const location = useLocation();
    const { setPageTitle } = useOutletContext();
    
    // Giả sử dữ liệu được truyền qua state khi click từ bảng
    const { productData } = location.state || { productData: {
        id: 59217,
        name: 'Sản phẩm A',
        currentCommissionPercent: 5,
        currentCommissionType: 'percent' // 'percent' hoặc 'fixed'
    }};

    const [formData, setFormData] = useState({
        commissionMethod: productData.currentCommissionType || '',
        commissionValue: productData.currentCommissionPercent || '',
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        setPageTitle(`Cập nhật hoa hồng sản phẩm: ${productData.name || '...'}`);
    }, [setPageTitle, productData.name]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };
    
    // Hàm format số tiền
    const formatCurrency = (value) => {
        if (typeof value !== 'number') return value;
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        // Tạm thời chỉ log và hiển thị thông báo giả lập
        console.log('Cập nhật hoa hồng:', { productId: productData.id, ...formData });
        
        try {
            // Trong thực tế, bạn sẽ gọi API PUT ở đây
            // Ví dụ: await axiosClient.put(`/products/${productData.id}/commission`, formData);
            
            setMessage('Cập nhật hoa hồng sản phẩm thành công!');
            setTimeout(() => navigate('/dl/products'), 1500); // Chuyển về trang danh sách sản phẩm của DL
        } catch (error) {
            console.error("Lỗi khi cập nhật hoa hồng:", error);
            setMessage('Lỗi cập nhật. Vui lòng thử lại.');
        }
    };

    return (
        <div>
            {/* Tiêu đề trang, đã được set qua setPageTitle */}
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Sản phẩm</h1>

            <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
                <h2 className="text-xl font-bold text-gray-700 mb-6">Thay đổi hoa hồng sản phẩm</h2>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        {/* Hàng 1: Mã sản phẩm & Tên sản phẩm */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoField label="Mã sản phẩm" value={productData.id} />
                            <InfoField label="Tên sản phẩm" value={productData.name} />
                        </div>
                        
                        {/* Hàng 2: Phương thức chia hoa hồng */}
                        <div>
                            <label htmlFor="commissionMethod" className="block text-sm font-medium text-gray-700 mb-1">Phương thức chia hoa hồng</label>
                            <select 
                                name="commissionMethod" 
                                id="commissionMethod" 
                                value={formData.commissionMethod} 
                                onChange={handleChange} 
                                className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" 
                                required
                            >
                                <option value="">Chọn phương thức chia</option>
                                <option value="percent">Phần trăm (%)</option>
                                <option value="fixed">Cố định (VND)</option>
                            </select>
                        </div>

                        {/* Hàng 3: Hoa hồng (Phần trăm hoặc Giá trị) */}
                        <div>
                            <label htmlFor="commissionValue" className="block text-sm font-medium text-gray-700 mb-1">
                                Hoa hồng {formData.commissionMethod === 'percent' ? 'Phần trăm (%)' : formData.commissionMethod === 'fixed' ? '(VND)' : ''}
                            </label>
                            <input 
                                type="text" // Dùng text để dễ dàng xử lý cả % và VND
                                name="commissionValue" 
                                id="commissionValue" 
                                value={formData.commissionValue} 
                                onChange={handleChange} 
                                placeholder={formData.commissionMethod === 'percent' ? "Nhập giá trị phần trăm" : "Nhập số tiền cố định"}
                                className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" 
                                required 
                            />
                            {formData.commissionMethod === 'fixed' && (
                                <p className="text-xs text-gray-400 mt-1">Ví dụ: 100000 (VND)</p>
                            )}
                        </div>
                    </div>

                    {message && <p className={`text-center mt-4 ${message.includes('thành công') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}

                    <div className="flex justify-end gap-4 mt-8">
                        <button 
                            type="button"
                            onClick={() => navigate(-1)} 
                            className="bg-red-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-600 transition-colors"
                        >
                            Hủy
                        </button>
                        <button 
                            type="submit"
                            className="bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 transition-colors"
                        >
                            Cập nhật
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductCommissionFormPage;