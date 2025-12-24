import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate, useParams } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useTranslation } from 'react-i18next';

// 1. Dùng danh sách Role cố định để đồng bộ với trang danh sách và tránh lỗi gọi API role
const STATIC_ROLES = [
    { role_id: 2, role_name: 'Nhà phân phối' },
    { role_id: 3, role_name: 'Đại lý' },
    { role_id: 4, role_name: 'Cộng tác viên' }
    // Role Admin và Khách hàng thường không nhận hoa hồng nên có thể ẩn bớt
];

const CommissionFormPage = ({ mode }) => {
    const { setPageTitle } = useOutletContext();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const tr = (key, defaultValue, options = {}) => t(key, { defaultValue, ...options });
    const { id } = useParams();
    const isEditMode = mode === 'edit';

    // --- State ---
    const [formData, setFormData] = useState({
        role_id: '',
        min_sales: '',
        max_sales: '',
        commission_rate: '',
        product_category: '',
        start_date: '',
        end_date: '',
        description: '',
        status: 'Active' // Thêm trạng thái mặc định
    });
    
    // Sử dụng static roles thay vì state roles rỗng
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        setPageTitle(isEditMode ? 'Chỉnh sửa Quy tắc Hoa hồng' : 'Tạo Quy tắc Hoa hồng Mới');

        const fetchData = async () => {
            if (isEditMode && id) {
                setLoading(true);
                try {
                    // Gọi API lấy chi tiết quy tắc
                    const response = await axiosClient.get(`/api/commission-rules/${id}`);
                    const ruleData = response.data?.data || response.data; // Handle trường hợp data bọc trong object hoặc không

                    if (ruleData) {
                        // Format ngày tháng để hiển thị đúng trong input type="date"
                        const formatDateForInput = (dateString) => {
                            if (!dateString) return '';
                            return new Date(dateString).toISOString().split('T')[0];
                        };

                        setFormData({
                            role_id: ruleData.role_id,
                            min_sales: ruleData.min_sales || '',
                            max_sales: ruleData.max_sales || '',
                            commission_rate: ruleData.commission_rate,
                            product_category: ruleData.product_category || '',
                            start_date: formatDateForInput(ruleData.start_date),
                            end_date: formatDateForInput(ruleData.end_date),
                            description: ruleData.description || '',
                            status: ruleData.status || 'Active'
                        });
                    }
                } catch (err) {
                    console.error("Lỗi tải dữ liệu:", err);
                    setError('Không thể tải thông tin quy tắc.');
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchData();
    }, [setPageTitle, isEditMode, id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        // --- Validate ---
        if (!formData.role_id) { setError(tr('admin.commissionForm.errors.roleRequired', 'Vui lòng chọn vai trò.')); setLoading(false); return; }
        if (!formData.commission_rate) { setError(tr('admin.commissionForm.errors.rateRequired', 'Vui lòng nhập tỷ lệ hoa hồng.')); setLoading(false); return; }

        // --- Chuẩn bị Payload ---
        // Chuyển đổi dữ liệu sang đúng định dạng Backend cần (số, null)
        const payload = {
            role_id: parseInt(formData.role_id, 10),
            commission_rate: parseFloat(formData.commission_rate),
            min_sales: formData.min_sales ? parseFloat(formData.min_sales) : 0,
            max_sales: formData.max_sales ? parseFloat(formData.max_sales) : null,
            product_category: formData.product_category || null,
            start_date: formData.start_date || null,
            end_date: formData.end_date || null,
            description: formData.description || null,
            status: formData.status
        };

        try {
            if (isEditMode) {
                await axiosClient.put(`/api/commission-rules/${id}`, payload);
                setSuccessMessage(tr('admin.common.updateSuccess', 'Cập nhật thành công!'));
            } else {
                await axiosClient.post('/api/commission-rules', payload);
                setSuccessMessage(tr('admin.common.createSuccess', 'Tạo mới thành công!'));
            }
            
            // Quay về trang danh sách sau 1.5s
            setTimeout(() => navigate('/admin/commission'), 1500);

        } catch (err) {
            console.error("Lỗi submit:", err);
            setError(err.response?.data?.message || tr('admin.common.saveError', 'Có lỗi xảy ra khi lưu dữ liệu.'));
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditMode && !formData.role_id) return <div className="text-center p-10">{t('general.loading')}</div>;

    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 max-w-3xl mx-auto shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                {isEditMode ? `${tr('admin.commissionForm.editRule', 'Chỉnh sửa Quy tắc')} ${id}` : tr('admin.commissionForm.createRule', 'Tạo Quy tắc Mới')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Hàng 1: Role & Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{tr('admin.commissionForm.fields.applyFor', 'Áp dụng cho')} <span className="text-red-500">*</span></label>
                        <select 
                            name="role_id" 
                            value={formData.role_id} 
                            onChange={handleChange} 
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        >
                            <option value="">-- {tr('admin.commissionForm.fields.chooseRole', 'Chọn vai trò')} --</option>
                            {STATIC_ROLES.map(role => (
                                <option key={role.role_id} value={role.role_id}>{role.role_name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{tr('admin.common.status', 'Trạng thái')}</label>
                        <select 
                            name="status" 
                            value={formData.status} 
                            onChange={handleChange} 
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="Active">{tr('status.active', 'Hoạt động')} (Active)</option>
                            <option value="Inactive">{tr('status.inactive', 'Ngừng')} (Inactive)</option>
                        </select>
                    </div>
                </div>

                {/* Hàng 2: Doanh số & Tỷ lệ */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{tr('admin.commissionForm.fields.minSales', 'Min Sales (VND)')}</label>
                        <input type="number" name="min_sales" value={formData.min_sales} onChange={handleChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 outline-none focus:border-blue-500" placeholder="0" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{tr('admin.commissionForm.fields.maxSales', 'Max Sales (VND)')}</label>
                        <input type="number" name="max_sales" value={formData.max_sales} onChange={handleChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 outline-none focus:border-blue-500" placeholder={tr('admin.common.unlimited', 'Không giới hạn')} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{tr('admin.commissionForm.fields.rate', 'Hoa hồng (%)')} <span className="text-red-500">*</span></label>
                        <input type="number" step="0.1" name="commission_rate" value={formData.commission_rate} onChange={handleChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 outline-none focus:border-blue-500 font-bold text-blue-600" required />
                    </div>
                </div>

                {/* Hàng 3: Thời gian */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{tr('admin.common.startDate', 'Ngày bắt đầu')}</label>
                        <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{tr('admin.common.endDate', 'Ngày kết thúc')}</label>
                        <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 outline-none" />
                    </div>
                </div>

                {/* Danh mục & Mô tả */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{tr('admin.commissionForm.fields.category', 'Danh mục sản phẩm')}</label>
                    <input type="text" name="product_category" value={formData.product_category} onChange={handleChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 outline-none" placeholder={tr('admin.commissionForm.fields.categoryPlaceholder', 'Ví dụ: Mỹ phẩm, Điện tử (Bỏ trống nếu áp dụng tất cả)')} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{tr('admin.common.description', 'Mô tả')}</label>
                    <textarea name="description" rows="3" value={formData.description} onChange={handleChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 outline-none" placeholder={tr('admin.common.notesPlaceholder', 'Ghi chú thêm...')}></textarea>
                </div>

                {/* Thông báo */}
                {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 text-sm rounded-lg text-center">{error}</div>}
                {successMessage && <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 text-sm rounded-lg text-center font-bold">{successMessage}</div>}

                {/* Buttons */}
                <div className="flex justify-end gap-4 pt-4 border-t">
                    <button type="button" onClick={() => navigate('/admin/commission')} className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium">{tr('admin.common.cancel', 'Hủy bỏ')}</button>
                    <button type="submit" disabled={loading} className={`px-5 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                        {loading ? tr('admin.common.processing', 'Đang xử lý...') : (isEditMode ? tr('admin.common.saveChanges', 'Lưu thay đổi') : tr('admin.commissionForm.createAction', 'Tạo quy tắc'))}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CommissionFormPage;