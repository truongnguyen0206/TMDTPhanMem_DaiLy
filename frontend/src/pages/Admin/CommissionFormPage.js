import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate, useParams } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

// mode: 'new' hoặc 'edit'
const CommissionFormPage = ({ mode }) => {
    const { setPageTitle } = useOutletContext();
    const navigate = useNavigate();
    const { id } = useParams(); // Lấy ID từ URL nếu là chế độ edit
    const isEditMode = mode === 'edit';

    // --- State ---
    const [formData, setFormData] = useState({
        role_id: '',
        min_sales: '',
        max_sales: '',
        commission_rate: '',
        product_category: '', // Tạm thời để trống, cần làm rõ cách quản lý category
        start_date: '',
        end_date: '',
        description: ''
    });
    const [roles, setRoles] = useState([]); // State cho danh sách vai trò
    const [loading, setLoading] = useState(isEditMode); // Loading khi edit
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        setPageTitle(isEditMode ? 'Chỉnh sửa Quy tắc Hoa hồng' : 'Tạo Quy tắc Hoa hồng Mới');

        // Hàm fetch dữ liệu cần thiết (roles và rule data nếu edit)
        const fetchData = async () => {
            setError('');
            setLoading(true);
            try {
                // Fetch danh sách vai trò
                const rolesResponse = await axiosClient.get('/roles'); //
                setRoles(rolesResponse.data || []);

                // Nếu là edit mode, fetch dữ liệu quy tắc hiện tại
                if (isEditMode && id) {
                    const ruleResponse = await axiosClient.get(`/api/commission-rules/${id}`); //
                    const ruleData = ruleResponse.data?.data;
                    if (ruleData) {
                        // Format lại ngày tháng trước khi set vào state
                        const formattedData = {
                            ...ruleData,
                            start_date: ruleData.start_date ? ruleData.start_date.split('T')[0] : '', // Lấy YYYY-MM-DD
                            end_date: ruleData.end_date ? ruleData.end_date.split('T')[0] : '',     // Lấy YYYY-MM-DD
                            min_sales: ruleData.min_sales ?? '', // Dùng ?? để xử lý null/undefined thành ''
                            max_sales: ruleData.max_sales ?? '',
                            product_category: ruleData.product_category ?? '',
                            description: ruleData.description ?? ''
                        };
                        setFormData(formattedData);
                    } else {
                        setError('Không tìm thấy quy tắc hoa hồng.');
                    }
                }
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu:", err);
                setError('Không thể tải dữ liệu cần thiết. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [setPageTitle, isEditMode, id]);

    // Xử lý thay đổi input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    // Xử lý submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        // --- Validate cơ bản ---
        if (!formData.role_id) { setError('Vui lòng chọn vai trò.'); return; }
        if (!formData.commission_rate || isNaN(formData.commission_rate) || formData.commission_rate < 0 || formData.commission_rate > 100) {
            setError('Tỷ lệ hoa hồng phải là số từ 0 đến 100.'); return;
        }
        if (formData.min_sales && isNaN(formData.min_sales)) { setError('Doanh số tối thiểu phải là số.'); return; }
        if (formData.max_sales && isNaN(formData.max_sales)) { setError('Doanh số tối đa phải là số.'); return; }
        if (formData.min_sales && formData.max_sales && parseFloat(formData.min_sales) >= parseFloat(formData.max_sales)) {
            setError('Doanh số tối thiểu phải nhỏ hơn tối đa.'); return;
        }
        if (formData.start_date && formData.end_date && new Date(formData.start_date) >= new Date(formData.end_date)) {
             setError('Ngày bắt đầu phải trước ngày kết thúc.'); return;
        }

        // --- Chuẩn bị payload ---
        const payload = {
            role_id: parseInt(formData.role_id, 10),
            commission_rate: parseFloat(formData.commission_rate),
            // Gửi null nếu trống, nếu không thì parse thành số
            min_sales: formData.min_sales === '' ? null : parseFloat(formData.min_sales),
            max_sales: formData.max_sales === '' ? null : parseFloat(formData.max_sales),
            product_category: formData.product_category === '' ? null : formData.product_category,
            start_date: formData.start_date === '' ? null : formData.start_date,
            end_date: formData.end_date === '' ? null : formData.end_date,
            description: formData.description === '' ? null : formData.description,
        };

        try {
            setLoading(true);
            if (isEditMode) {
                // Gọi API PUT
                await axiosClient.put(`/api/commission-rules/${id}`, payload); //
                setSuccessMessage('Cập nhật quy tắc hoa hồng thành công!');
            } else {
                // Gọi API POST
                await axiosClient.post('/api/commission-rules', payload); //
                setSuccessMessage('Tạo mới quy tắc hoa hồng thành công!');
            }
            // Chuyển hướng về trang danh sách sau khi thành công
            setTimeout(() => navigate('/admin/commission'), 1500);
        } catch (err) {
            console.error(`Lỗi khi ${isEditMode ? 'cập nhật' : 'tạo'} quy tắc:`, err);
            const apiError = err.response?.data?.message || err.message || 'Thao tác thất bại.';
             // Hiển thị lỗi cụ thể từ backend nếu có (ví dụ: lỗi conflict)
            const backendErrors = err.response?.data?.errors;
            setError(`Lỗi: ${apiError}${backendErrors ? ` (${backendErrors.join(', ')})` : ''}`);
        } finally {
            setLoading(false);
        }
    };

    // Hiển thị loading
    if (loading && isEditMode) { // Chỉ hiển thị loading toàn trang khi đang edit
        return <div className="text-center p-10">Đang tải thông tin quy tắc...</div>;
    }

    // Hiển thị lỗi nếu không load được data khi edit
    if (error && isEditMode && !formData.role_id) {
         return <div className="text-center p-10 text-red-600">{error}</div>;
    }

    return (
        <div className="bg-white p-8 rounded-xl border border-gray-200 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{isEditMode ? `Chỉnh sửa Quy tắc (ID: ${id})` : 'Tạo Quy tắc Hoa hồng Mới'}</h2>

            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {/* Role */}
                    <div>
                        <label htmlFor="role_id" className="block text-sm font-medium text-gray-700 mb-1">Áp dụng cho Vai trò <span className="text-red-500">*</span></label>
                        <select name="role_id" id="role_id" value={formData.role_id} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" required>
                            <option value="">-- Chọn vai trò --</option>
                            {roles.map(role => (
                                <option key={role.role_id} value={role.role_id}>
                                    {role.role_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Sales Range */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label htmlFor="min_sales" className="block text-sm font-medium text-gray-700 mb-1">Doanh số tối thiểu (VND)</label>
                            <input type="number" name="min_sales" id="min_sales" value={formData.min_sales} onChange={handleChange} placeholder="Bỏ trống nếu không áp dụng" className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" min="0" step="any"/>
                        </div>
                        <div>
                            <label htmlFor="max_sales" className="block text-sm font-medium text-gray-700 mb-1">Doanh số tối đa (VND)</label>
                            <input type="number" name="max_sales" id="max_sales" value={formData.max_sales} onChange={handleChange} placeholder="Bỏ trống nếu không giới hạn" className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" min="0" step="any"/>
                        </div>
                    </div>

                    {/* Commission Rate & Product Category */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="commission_rate" className="block text-sm font-medium text-gray-700 mb-1">Tỷ lệ Hoa hồng (%) <span className="text-red-500">*</span></label>
                            <input type="number" name="commission_rate" id="commission_rate" value={formData.commission_rate} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" required min="0" max="100" step="0.01"/>
                        </div>
                        <div>
                            <label htmlFor="product_category" className="block text-sm font-medium text-gray-700 mb-1">Danh mục Sản phẩm (Tùy chọn)</label>
                            <input type="text" name="product_category" id="product_category" value={formData.product_category} onChange={handleChange} placeholder="Nhập tên danh mục (nếu có)" className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" />
                            {/* TODO: Thay bằng Select nếu có API lấy danh mục */}
                        </div>
                    </div>

                    {/* Date Range */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu (Tùy chọn)</label>
                            <input type="date" name="start_date" id="start_date" value={formData.start_date} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" />
                        </div>
                        <div>
                            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc (Tùy chọn)</label>
                            <input type="date" name="end_date" id="end_date" value={formData.end_date} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" />
                             <p className="text-xs text-gray-400 mt-1">Bỏ trống nếu quy tắc vô thời hạn.</p>
                        </div>
                    </div>

                    {/* Description */}
                     <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Mô tả (Tùy chọn)</label>
                        <textarea name="description" id="description" rows="3" value={formData.description} onChange={handleChange} placeholder="Thêm mô tả chi tiết về quy tắc..." className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent"></textarea>
                    </div>
                </div>

                {/* Hiển thị thông báo */}
                {error && <p className="text-red-600 text-center mt-4">{error}</p>}
                {successMessage && <p className="text-green-600 text-center mt-4">{successMessage}</p>}

                {/* Nút bấm */}
                <div className="flex justify-end gap-4 mt-8">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/commission')}
                        className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        className={`bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={loading} // Disable nút khi đang loading
                    >
                         {loading ? 'Đang xử lý...' : (isEditMode ? 'Lưu thay đổi' : 'Tạo quy tắc')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CommissionFormPage;