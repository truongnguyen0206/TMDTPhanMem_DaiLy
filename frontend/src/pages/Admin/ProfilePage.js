import React, { useEffect, useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LuCamera } from 'react-icons/lu';
import { useTranslation } from 'react-i18next';
// import avatar from '../../assets/images/logo.png';
import avatar from '../../assets/images/logo3.jpg';

// Component con để hiển thị thông tin tĩnh (Read-only)
const InfoFieldReadOnly = ({ label, value, fallback = 'N/A' }) => (
    <div>
        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
        <div className="bg-gray-50 dark:bg-gray-900/30 p-3 rounded-md text-gray-700 dark:text-gray-200 font-medium min-h-[44px] flex items-center">
            {value || fallback}
        </div>
    </div>
);

const ProfilePage = () => {
    const { setPageTitle } = useOutletContext();
    const { user } = useAuth();
    const { t, i18n } = useTranslation();
    const tr = (key, defaultValue, options = {}) => t(key, { defaultValue, ...options });

    // --- STATE QUẢN LÝ CHẾ ĐỘ ---
    // 'VIEW' (Xem), 'EDIT_PROFILE' (Sửa hồ sơ), 'EDIT_PASSWORD' (Đổi pass)
    const [viewMode, setViewMode] = useState('VIEW');
    // ----------------------------

    // State cho thông tin cá nhân
    const [initialData, setInitialData] = useState({
        fullName: user?.username || 'Admin User',
        gender: 'Nam',
        dob: '1990-01-01',
        phone: '0123456789'
    });
    const [formData, setFormData] = useState(initialData);

    // State cho mật khẩu
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordMessage, setPasswordMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        setPageTitle(t('admin.profile.pageTitle', { defaultValue: 'Thông tin cá nhân' }));
        const data = {
            fullName: user?.username || 'Admin User',
            gender: 'Nam',
            dob: '1990-01-01',
            phone: '0123456789'
        };
        setInitialData(data);
        setFormData(data);
    }, [setPageTitle, user, t, i18n.language]);

    // Kiểm tra thay đổi thông tin cá nhân
    const isProfileChanged = useMemo(() => {
        return (
            formData.fullName !== initialData.fullName ||
            formData.gender !== initialData.gender ||
            formData.dob !== initialData.dob ||
            formData.phone !== initialData.phone
        );
    }, [formData, initialData]);

    // Kiểm tra form mật khẩu
    const isPasswordFormValid = useMemo(() => {
        return (
            passwordData.currentPassword.length > 0 &&
            passwordData.newPassword.length > 0 &&
            passwordData.confirmPassword.length > 0
        );
    }, [passwordData]);

    // Xử lý thay đổi thông tin cá nhân
    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    // Xử lý thay đổi mật khẩu
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prevState => ({
            ...prevState,
            [name]: value
        }));
        setPasswordMessage({ text: '', type: '' });
    };

    const handleAvatarEdit = () => {
        alert(tr('admin.profile.avatarComingSoon', 'Chức năng tải lên avatar đang được phát triển!'));
    };

    // --- HÀM XỬ LÝ NÚT CHÍNH ---

    // Bấm nút "Cập nhật hồ sơ"
    const handleEditProfileClick = () => {
        setViewMode('EDIT_PROFILE');
    };

    // Bấm nút "Đổi mật khẩu"
    const handleChangePasswordClick = () => {
        setViewMode('EDIT_PASSWORD');
    };

    // Bấm nút "Hủy" (chung cho cả 2 form)
    const handleCancel = () => {
        setViewMode('VIEW');
        // Reset cả 2 form về trạng thái ban đầu
        setFormData(initialData);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordMessage({ text: '', type: '' });
    };

    // --- HÀM SUBMIT ---

    // Xử lý submit thông tin cá nhân
    const handleProfileSubmit = (e) => {
        e.preventDefault();
        if (!isProfileChanged) return;

        console.log("Đã cập nhật (giả lập):", formData);
        alert(tr('admin.profile.updatedMock', 'Thông tin đã được cập nhật (giả lập)!'));

        setInitialData(formData); // Lưu trạng thái mới
        setViewMode('VIEW'); // Quay về chế độ xem
    };

    // Xử lý submit mật khẩu
    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (!isPasswordFormValid) return;

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordMessage({ text: tr('admin.profile.passwordMismatch', 'Mật khẩu mới và xác nhận không khớp!'), type: 'error' });
            return;
        }
        if (passwordData.newPassword.length < 6) {
            setPasswordMessage({ text: tr('admin.profile.passwordMinLen', 'Mật khẩu mới phải có ít nhất 6 ký tự!'), type: 'error' });
            return;
        }

        console.log("Đổi mật khẩu (giả lập) với:", passwordData);
        setPasswordMessage({ text: tr('admin.profile.passwordChangedMock', 'Đổi mật khẩu thành công (giả lập)!'), type: 'success' });

        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        // Tùy chọn: Tự động quay về sau khi thành công
        setTimeout(() => setViewMode('VIEW'), 1500);
    };

    // --- HÀM RENDER NỘI DUNG CARD ---
    const renderContent = () => {
        switch (viewMode) {
            // --- CHẾ ĐỘ XEM (Mặc định) ---
            case 'VIEW':
                return (
                    <div>
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Thông tin chi tiết</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoFieldReadOnly label="Tên đăng nhập" value={user.username} />
                            <InfoFieldReadOnly label="Vai trò" value={user.role} />
                            <InfoFieldReadOnly label="Email" value={user.email} />
                            <InfoFieldReadOnly label="Số điện thoại" value={initialData.phone} />
                        </div>
                    </div>
                );

            // --- CHẾ ĐỘ SỬA HỒ SƠ ---
            case 'EDIT_PROFILE':
                return (
                    <form className="space-y-6" onSubmit={handleProfileSubmit}>
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">{tr('admin.profile.actions.editProfile', 'Cập nhật hồ sơ')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Họ và Tên</label>
                                <input
                                    type="text" id="fullName" name="fullName"
                                    value={formData.fullName} onChange={handleProfileChange}
                                    className="w-full bg-gray-100 dark:bg-gray-700 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{tr('admin.profile.fields.gender', 'Giới tính')}</label>
                                <select
                                    id="gender" name="gender"
                                    value={formData.gender} onChange={handleProfileChange}
                                    className="w-full bg-gray-100 dark:bg-gray-700 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="Nam">Nam</option>
                                    <option value="Nữ">Nữ</option>
                                    <option value="Khác">Khác</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{tr('admin.profile.fields.phone', 'Số điện thoại')}</label>
                                <input
                                    type="tel" id="phone" name="phone"
                                    value={formData.phone} onChange={handleProfileChange}
                                    className="w-full bg-gray-100 dark:bg-gray-700 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label htmlFor="dob" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{tr('admin.profile.fields.dob', 'Ngày sinh')}</label>
                                <input
                                    type="date" id="dob" name="dob"
                                    value={formData.dob} onChange={handleProfileChange}
                                    className="w-full bg-gray-100 dark:bg-gray-700 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Nút bấm cho chế độ SỬA */}
                        <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={!isProfileChanged}
                                className={`font-bold py-2 px-6 rounded-lg transition-colors 
                                    ${isProfileChanged
                                        ? 'bg-primary text-white hover:bg-blue-700'
                                        : 'bg-blue-300 text-white opacity-70 cursor-not-allowed'
                                    }`}
                            >
                                Lưu thay đổi
                            </button>
                        </div>
                    </form>
                );

            // --- CHẾ ĐỘ ĐỔI MẬT KHẨU ---
            case 'EDIT_PASSWORD':
                return (
                    <form className="space-y-6" onSubmit={handlePasswordSubmit}>
                        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Đổi Mật Khẩu</h2>
                        <div>
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{tr('admin.profile.fields.currentPassword', 'Mật khẩu hiện tại')}</label>
                            <input
                                type="password" id="currentPassword" name="currentPassword"
                                value={passwordData.currentPassword} onChange={handlePasswordChange}
                                placeholder="Nhập mật khẩu hiện tại"
                                className="w-full bg-gray-100 dark:bg-gray-700 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{tr('admin.profile.fields.newPassword', 'Mật khẩu mới')}</label>
                            <input
                                type="password" id="newPassword" name="newPassword"
                                value={passwordData.newPassword} onChange={handlePasswordChange}
                                placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                                className="w-full bg-gray-100 dark:bg-gray-700 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{tr('admin.profile.fields.confirmPassword', 'Xác nhận mật khẩu mới')}</label>
                            <input
                                type="password" id="confirmPassword" name="confirmPassword"
                                value={passwordData.confirmPassword} onChange={handlePasswordChange}
                                placeholder="Nhập lại mật khẩu mới"
                                className="w-full bg-gray-100 dark:bg-gray-700 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                                required
                            />
                        </div>

                        {passwordMessage.text && (
                            <p className={`text-sm text-center ${passwordMessage.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                                {passwordMessage.text}
                            </p>
                        )}

                        <div className="flex justify-end pt-6 border-t gap-4">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={!isPasswordFormValid}
                                className={`font-bold py-2 px-6 rounded-lg transition-colors 
                                    ${isPasswordFormValid
                                        ? 'bg-primary text-white hover:bg-blue-700'
                                        : 'bg-blue-300 text-white opacity-70 cursor-not-allowed'
                                    }`}
                            >
                                Đổi mật khẩu
                            </button>
                        </div>
                    </form>
                );

            default:
                return null;
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-3xl mx-auto border border-gray-200 dark:border-gray-700">

                {/* Avatar */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <img
                            src={avatar}
                            alt="Avatar"
                            className="h-32 w-32 rounded-full object-cover border-4 border-primary"
                        />
                        <button
                            onClick={handleAvatarEdit}
                            className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 rounded-full p-2 shadow-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="Thay đổi avatar"
                        >
                            <LuCamera size={20} className="text-gray-600 dark:text-gray-300" />
                        </button>
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4 text-center">{initialData.fullName}</h2>

                {/* --- CÁC NÚT TOGGLE (Chỉ hiển thị ở chế độ VIEW) --- */}
                {viewMode === 'VIEW' && (
                    <div className="flex justify-center gap-4 mb-8 pb-8 border-b">
                        <button
                            type="button"
                            onClick={handleChangePasswordClick}
                            className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            Đổi mật khẩu
                        </button>
                        <button
                            type="button"
                            onClick={handleEditProfileClick}
                            className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Cập nhật hồ sơ
                        </button>
                    </div>
                )}

                {/* --- NỘI DUNG CARD THAY ĐỔI --- */}
                {user ? (
                    renderContent()
                ) : (
                    <p>Không thể tải thông tin người dùng.</p>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;