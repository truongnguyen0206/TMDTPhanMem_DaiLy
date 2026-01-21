import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useTranslation } from 'react-i18next';

// Danh sách vai trò cố định (Khớp với DB)
const STATIC_ROLES = [
    { role_id: 2, role_name: 'Nhà phân phối' },
    { role_id: 3, role_name: 'Đại lý' },
    { role_id: 4, role_name: 'Cộng tác viên' },
    { role_id: 5, role_name: 'Khách hàng' }
];

const AddAccountPage = () => {
    const { setPageTitle } = useOutletContext();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const tr = (key, defaultValue, options = {}) => t(key, { defaultValue, ...options });

    // Tab: 'manually' hoặc 'csv'
    const [activeTab, setActiveTab] = useState('manually');

    // State Form - Đã xóa cccd và tier cho khớp DB
    const [formData, setFormData] = useState({
        username: '',  // Map với BE: username
        email: '',
        password: '',
        phone: '',
        role_id: '',   // Map với BE: role_id
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        setPageTitle(t('admin.addAccount.pageTitle', { defaultValue: 'Thêm Tài Khoản Mới' }));
    }, [setPageTitle, t, i18n.language]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        setLoading(true);

        // 1. Validate cơ bản
        if (!formData.role_id) {
            setMessage({ text: 'Vui lòng chọn vai trò cho tài khoản.', type: 'error' });
            setLoading(false);
            return;
        }

        // 2. Chuẩn bị dữ liệu gửi đi (Khớp với BE user_controller.createUser)
        const payload = {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            role_id: parseInt(formData.role_id, 10)
        };

        try {
            // 3. Gọi API (Lưu ý: API này cần Auth & Role Admin như đã sửa ở bước trước)
            await axiosClient.post('/users/createUser', payload);

            setMessage({ text: 'Tạo tài khoản thành công!', type: 'success' });

            // Chuyển trang sau 1.5s
            setTimeout(() => navigate('/admin/accounts'), 1500);

        } catch (error) {
            console.error("Lỗi khi tạo tài khoản:", error);
            const errorMsg = error.response?.data?.message || error.message || tr('admin.common.errorOccurred', 'Có lỗi xảy ra.');
            setMessage({ text: `${tr('admin.common.createFailPrefix', 'Tạo thất bại: ')}${errorMsg}`, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">{tr('admin.addAccount.title', 'Thêm Tài Khoản')}</h2>

            {/* Tabs chuyển đổi */}
            <div className="flex border-b mb-6">
                <button
                    onClick={() => setActiveTab('manually')}
                    className={`py-2 px-4 text-sm font-medium transition-colors ${activeTab === 'manually' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                >
                    {tr('admin.addAccount.tabs.manual', 'Thêm thủ công')}
                </button>
                <button
                    onClick={() => setActiveTab('csv')}
                    className={`py-2 px-4 text-sm font-medium transition-colors ${activeTab === 'csv' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                >
                    {tr('admin.addAccount.tabs.csv', 'Nhập từ Excel/CSV')}
                </button>
            </div>

            {/* FORM THÊM THỦ CÔNG */}
            {activeTab === 'manually' && (
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {/* --- Cột Trái: Thông tin đăng nhập cơ bản --- */}
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{tr('admin.addAccount.fields.username', 'Tên tài khoản / Họ tên')} <span className="text-red-500">*</span></label>
                                <input
                                    type="text" name="username" id="username"
                                    value={formData.username} onChange={handleChange}
                                    placeholder={tr('admin.addAccount.fields.usernamePlaceholder', 'Ví dụ: nguyenvan_a')}
                                    className="w-full bg-gray-50 dark:bg-gray-900/30 border border-gray-300 dark:border-gray-600 rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Email <span className="text-red-500">*</span></label>
                                <input
                                    type="email" name="email" id="email"
                                    value={formData.email} onChange={handleChange}
                                    className="w-full bg-gray-50 dark:bg-gray-900/30 border border-gray-300 dark:border-gray-600 rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{tr('admin.addAccount.fields.password', 'Mật khẩu')} <span className="text-red-500">*</span></label>
                                <input
                                    type="password" name="password" id="password"
                                    value={formData.password} onChange={handleChange}
                                    className="w-full bg-gray-50 dark:bg-gray-900/30 border border-gray-300 dark:border-gray-600 rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                    required
                                />
                            </div>
                        </div>

                        {/* --- Cột Phải: Thông tin bổ sung & Vai trò --- */}
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{tr('admin.addAccount.fields.phone', 'Số điện thoại')}</label>
                                <input
                                    type="tel" name="phone" id="phone"
                                    value={formData.phone} onChange={handleChange}
                                    className="w-full bg-gray-50 dark:bg-gray-900/30 border border-gray-300 dark:border-gray-600 rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                />
                            </div>

                            {/* Chuyển Role sang cột phải cho cân đối */}
                            <div>
                                <label htmlFor="role_id" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{tr('admin.addAccount.fields.role', 'Vai trò')} <span className="text-red-500">*</span></label>
                                <select
                                    name="role_id" id="role_id"
                                    value={formData.role_id} onChange={handleChange}
                                    className="w-full bg-gray-50 dark:bg-gray-900/30 border border-gray-300 dark:border-gray-600 rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none cursor-pointer"
                                    required
                                >
                                    <option value="">-- {tr('admin.addAccount.fields.chooseRole', 'Chọn vai trò')} --</option>
                                    {STATIC_ROLES.map(role => (
                                        <option key={role.role_id} value={role.role_id}>
                                            {role.role_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Thông báo lỗi/thành công */}
                    {message.text && (
                        <div className={`mt-6 p-3 rounded-lg text-center text-sm font-medium ${message.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-600' : 'bg-green-50 dark:bg-green-900/20 text-green-600'}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="mt-8 flex gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/accounts')}
                            className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-8 py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors flex-1 md:flex-none ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? tr('admin.common.processing', 'Đang xử lý...') : tr('admin.addAccount.actions.create', 'Tạo tài khoản')}
                        </button>
                    </div>
                </form>
            )}

            {/* TAB IMPORT CSV (Giữ nguyên placeholder) */}
            {activeTab === 'csv' && (
                <div className="py-10 text-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">{tr('admin.addAccount.csvComingSoon', 'Tính năng Import CSV đang được phát triển.')}</p>
                    <button className="text-primary font-medium hover:underline">{tr('admin.addAccount.downloadCsvTemplate', 'Tải mẫu file CSV')}</button>
                </div>
            )}
        </div>
    );
};

export default AddAccountPage;