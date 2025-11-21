import React, { useEffect, useState, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LuCamera } from 'react-icons/lu';
import avatar from '../../assets/images/logo.png'; // Dùng chung avatar

// Component con để hiển thị thông tin tĩnh (Read-only)
const InfoFieldReadOnly = ({ label, value }) => (
    <div className="md:col-span-1">
        <label className="block text-sm font-medium text-gray-500 mb-1">{label}</label>
        <div className="bg-gray-50 p-3 rounded-md text-gray-700 font-medium min-h-[44px] flex items-center">
            {value || 'N/A'}
        </div>
    </div>
);

const ProfilePage = () => {
    const { setPageTitle } = useOutletContext();
    const { user } = useAuth();
    const navigate = useNavigate();

    // --- STATE QUẢN LÝ CHẾ ĐỘ ---
    // 'VIEW' (Xem), 'EDIT_PROFILE' (Sửa hồ sơ), 'EDIT_PASSWORD' (Đổi pass)
    const [viewMode, setViewMode] = useState('VIEW');
    // ----------------------------

    // Dữ liệu tĩnh/mock cho NPP
    const staticNPPData = {
        nppCode: `NPP${String(user.id || '001').padStart(3, '0')}`,
        tier: 'Vàng'
    };

    // State cho thông tin cá nhân (dùng dữ liệu mock)
    const [initialData, setInitialData] = useState({
        businessName: user?.username || 'Công ty TNHH Một Thành Viên ABC',
        taxCode: '0123456789',
        address: '123 Đường XYZ, Phường A, Quận B, TP. HCM',
        businessLicense: 'GPKD-123456',
        representative: 'Nguyễn Văn B',
        contactInfo: '0987654321 / lienhe@abc.com',
        bankInfo: 'Ngân hàng VCB\nSTK: 00123456789\nChủ TK: Nguyễn Văn B'
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
        setPageTitle('Thông tin cá nhân');
        // Khởi tạo form data
        setInitialData(formData); 
    }, [setPageTitle, user]);

    // Kiểm tra thay đổi thông tin cá nhân
    const isProfileChanged = useMemo(() => {
        return (
            formData.businessName !== initialData.businessName ||
            formData.taxCode !== initialData.taxCode ||
            formData.address !== initialData.address ||
            formData.businessLicense !== initialData.businessLicense ||
            formData.representative !== initialData.representative ||
            formData.contactInfo !== initialData.contactInfo ||
            formData.bankInfo !== initialData.bankInfo
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

    // Xử lý thay đổi thông tin
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
        alert('Chức năng tải lên avatar đang được phát triển!');
    };

    // --- HÀM XỬ LÝ NÚT CHÍNH ---

    const handleEditProfileClick = () => setViewMode('EDIT_PROFILE');
    const handleChangePasswordClick = () => setViewMode('EDIT_PASSWORD');

    const handleCancel = () => {
        setViewMode('VIEW');
        setFormData(initialData);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordMessage({ text: '', type: '' });
    };

    // --- HÀM SUBMIT ---

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        if (!isProfileChanged) return;
        console.log("Đã cập nhật (giả lập):", formData);
        alert('Thông tin đã được cập nhật (giả lập)!');
        setInitialData(formData);
        setViewMode('VIEW');
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (!isPasswordFormValid) return;

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordMessage({ text: 'Mật khẩu mới và xác nhận không khớp!', type: 'error' });
            return;
        }
        if (passwordData.newPassword.length < 6) {
            setPasswordMessage({ text: 'Mật khẩu mới phải có ít nhất 6 ký tự!', type: 'error' });
            return;
        }

        console.log("Đổi mật khẩu (giả lập) với:", passwordData);
        setPasswordMessage({ text: 'Đổi mật khẩu thành công (giả lập)!', type: 'success' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setViewMode('VIEW'), 1500); 
    };
    
    // --- HÀM RENDER NỘI DUNG CARD ---
    const renderContent = () => {
        switch (viewMode) {
            // --- CHẾ ĐỘ XEM (Mặc định) ---
            case 'VIEW':
                return (
                    <div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-4">Thông tin chi tiết</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoFieldReadOnly label="Mã NPP" value={staticNPPData.nppCode} />
                            <InfoFieldReadOnly label="Phân cấp (Tier)" value={staticNPPData.tier} />
                            <InfoFieldReadOnly label="Tên Doanh nghiệp" value={initialData.businessName} />
                            <InfoFieldReadOnly label="Mã Số thuế" value={initialData.taxCode} />
                            <InfoFieldReadOnly label="Địa chỉ" value={initialData.address} />
                            <InfoFieldReadOnly label="Người đại diện" value={initialData.representative} />
                        </div>
                    </div>
                );

            // --- CHẾ ĐỘ SỬA HỒ SƠ ---
            case 'EDIT_PROFILE':
                return (
                    <form className="space-y-6" onSubmit={handleProfileSubmit}>
                        <h3 className="text-xl font-semibold text-gray-700 mb-4">Cập nhật hồ sơ</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Tên Doanh nghiệp */}
                            <div>
                                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">Tên Doanh nghiệp</label>
                                <input type="text" id="businessName" name="businessName" value={formData.businessName} onChange={handleProfileChange}
                                    className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" />
                            </div>
                            {/* Mã Số thuế */}
                            <div>
                                <label htmlFor="taxCode" className="block text-sm font-medium text-gray-700 mb-1">Mã Số thuế</label>
                                <input type="text" id="taxCode" name="taxCode" value={formData.taxCode} onChange={handleProfileChange}
                                    className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" />
                            </div>
                            {/* Địa chỉ */}
                            <div className="md:col-span-2">
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                                <input type="text" id="address" name="address" value={formData.address} onChange={handleProfileChange}
                                    className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" />
                            </div>
                            {/* Giấy phép kinh doanh */}
                            <div>
                                <label htmlFor="businessLicense" className="block text-sm font-medium text-gray-700 mb-1">Giấy phép kinh doanh</label>
                                <input type="text" id="businessLicense" name="businessLicense" value={formData.businessLicense} onChange={handleProfileChange}
                                    className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" />
                            </div>
                            {/* Người đại diện */}
                            <div>
                                <label htmlFor="representative" className="block text-sm font-medium text-gray-700 mb-1">Người đại diện</label>
                                <input type="text" id="representative" name="representative" value={formData.representative} onChange={handleProfileChange}
                                    className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" />
                            </div>
                            {/* SĐT/Email liên hệ */}
                            <div className="md:col-span-2">
                                <label htmlFor="contactInfo" className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại/Email liên hệ</label>
                                <input type="text" id="contactInfo" name="contactInfo" value={formData.contactInfo} onChange={handleProfileChange}
                                    className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" />
                            </div>
                            {/* Thông tin ngân hàng */}
                            <div className="md:col-span-2">
                                <label htmlFor="bankInfo" className="block text-sm font-medium text-gray-700 mb-1">Thông tin ngân hàng</label>
                                <textarea id="bankInfo" name="bankInfo" rows="3" value={formData.bankInfo} onChange={handleProfileChange}
                                    className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" />
                            </div>
                        </div>
                        
                        <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
                            <button type="button" onClick={handleCancel}
                                className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors">
                                Hủy
                            </button>
                            <button type="submit" disabled={!isProfileChanged}
                                className={`font-bold py-2 px-6 rounded-lg transition-colors 
                                    ${isProfileChanged 
                                        ? 'bg-primary text-white hover:bg-blue-700' 
                                        : 'bg-blue-300 text-white opacity-70 cursor-not-allowed'
                                    }`}>
                                Lưu thay đổi
                            </button>
                        </div>
                    </form>
                );

            // --- CHẾ ĐỘ ĐỔI MẬT KHẨU ---
            case 'EDIT_PASSWORD':
                return (
                    <form className="space-y-6" onSubmit={handlePasswordSubmit}>
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Đổi Mật Khẩu</h2>
                        <div>
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
                            <input type="password" id="currentPassword" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange}
                                placeholder="Nhập mật khẩu hiện tại"
                                className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" required />
                        </div>
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                            <input type="password" id="newPassword" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange}
                                placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                                className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" required />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                            <input type="password" id="confirmPassword" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange}
                                placeholder="Nhập lại mật khẩu mới"
                                className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" required />
                        </div>

                        {passwordMessage.text && (
                            <p className={`text-sm text-center ${passwordMessage.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                                {passwordMessage.text}
                            </p>
                        )}

                        <div className="flex justify-end pt-6 border-t gap-4">
                            <button type="button" onClick={handleCancel}
                                className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors">
                                Hủy
                            </button>
                            <button type="submit" disabled={!isPasswordFormValid}
                                className={`font-bold py-2 px-6 rounded-lg transition-colors 
                                    ${isPasswordFormValid 
                                        ? 'bg-primary text-white hover:bg-blue-700' 
                                        : 'bg-blue-300 text-white opacity-70 cursor-not-allowed'
                                    }`}>
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
            <div className="bg-white p-8 rounded-lg shadow-md max-w-3xl mx-auto border border-gray-200">
                
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
                            className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md border border-gray-200 hover:bg-gray-100 transition-colors"
                            title="Thay đổi avatar"
                        >
                            <LuCamera size={20} className="text-gray-600" />
                        </button>
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">{initialData.businessName}</h2>
                
                {/* --- CÁC NÚT TOGGLE (Chỉ hiển thị ở chế độ VIEW) --- */}
                {viewMode === 'VIEW' && (
                    <div className="flex justify-center gap-4 mb-8 pb-8 border-b">
                        <button
                            type="button"
                            onClick={handleChangePasswordClick}
                            className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors"
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