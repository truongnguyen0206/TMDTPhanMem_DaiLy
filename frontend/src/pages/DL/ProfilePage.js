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

// Component con cho Trạng thái (để hiển thị màu)
const StatusBadge = ({ status }) => {
    const isActive = status === 'Hoạt động';
    const colorClasses = isActive 
        ? 'bg-green-100 text-green-800' 
        : 'bg-red-100 text-red-800';
    return (
        <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Trạng thái</label>
            <div className={`p-3 rounded-md font-medium min-h-[44px] flex items-center ${colorClasses}`}>
                {status}
            </div>
        </div>
    );
};


const ProfilePage = () => {
    const { setPageTitle } = useOutletContext();
    const { user } = useAuth();
    const navigate = useNavigate();

    // --- STATE QUẢN LÝ CHẾ ĐỘ ---
    const [viewMode, setViewMode] = useState('VIEW');
    // ----------------------------

    // Dữ liệu tĩnh/mock cho Đại lý (phần VIEW)
    const staticDLData = {
        agentCode: `DL${String(user.id || '001').padStart(3, '0')}`,
        status: 'Hoạt động', // Mock data
        nppCode: 'NPP001', // Mock data
        tier: 'Bạc', // Mock data
        loginEmail: user.email || 'agent@email.com',
        loginPhone: user.phone || '0123456789' // Giả sử SĐT đăng nhập lấy từ user
    };

    // State cho thông tin có thể chỉnh sửa
    const [initialData, setInitialData] = useState({
        agentName: user?.username || 'Đại lý ABC',
        ownerName: 'Nguyễn Văn A',
        cccd: '001234567890',
        personalTaxCode: 'MSTCN12345',
        address: '456 Đường DEF, Phường C, Quận D, TP. Hà Nội',
        contactPhone: '0909123456',
        bankInfo: 'Ngân hàng ACB\nSTK: 987654321\nChủ TK: Nguyễn Văn A'
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
        setInitialData(formData);
    }, [setPageTitle, user]);

    // Kiểm tra thay đổi thông tin cá nhân
    const isProfileChanged = useMemo(() => {
        return (
            formData.agentName !== initialData.agentName ||
            formData.ownerName !== initialData.ownerName ||
            formData.cccd !== initialData.cccd ||
            formData.personalTaxCode !== initialData.personalTaxCode ||
            formData.address !== initialData.address ||
            formData.contactPhone !== initialData.contactPhone ||
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
                            <InfoFieldReadOnly label="Mã Đại lý" value={staticDLData.agentCode} />
                            <StatusBadge status={staticDLData.status} />
                            <InfoFieldReadOnly label="Mã NPP (Quản lý)" value={staticDLData.nppCode} />
                            <InfoFieldReadOnly label="Phân cấp (Tier)" value={staticDLData.tier} />
                            <InfoFieldReadOnly label="Email đăng nhập" value={staticDLData.loginEmail} />
                            <InfoFieldReadOnly label="SĐT đăng nhập" value={staticDLData.loginPhone} />
                        </div>
                    </div>
                );

            // --- CHẾ ĐỘ SỬA HỒ SƠ ---
            case 'EDIT_PROFILE':
                return (
                    <form className="space-y-6" onSubmit={handleProfileSubmit}>
                        <h3 className="text-xl font-semibold text-gray-700 mb-4">Cập nhật hồ sơ</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Tên Đại lý */}
                            <div>
                                <label htmlFor="agentName" className="block text-sm font-medium text-gray-700 mb-1">Tên Đại lý</label>
                                <input type="text" id="agentName" name="agentName" value={formData.agentName} onChange={handleProfileChange}
                                    className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" />
                            </div>
                            {/* Họ tên chủ đại lý */}
                            <div>
                                <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700 mb-1">Họ và tên chủ đại lý</label>
                                <input type="text" id="ownerName" name="ownerName" value={formData.ownerName} onChange={handleProfileChange}
                                    className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" />
                            </div>
                            {/* Số CCCD */}
                            <div>
                                <label htmlFor="cccd" className="block text-sm font-medium text-gray-700 mb-1">Số CCCD</label>
                                <input type="text" id="cccd" name="cccd" value={formData.cccd} onChange={handleProfileChange}
                                    className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" />
                            </div>
                            {/* MST Cá nhân */}
                            <div>
                                <label htmlFor="personalTaxCode" className="block text-sm font-medium text-gray-700 mb-1">Mã Số thuế cá nhân</label>
                                <input type="text" id="personalTaxCode" name="personalTaxCode" value={formData.personalTaxCode} onChange={handleProfileChange}
                                    className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" />
                            </div>
                            {/* Địa chỉ */}
                            <div className="md:col-span-2">
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                                <input type="text" id="address" name="address" value={formData.address} onChange={handleProfileChange}
                                    className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" />
                            </div>
                             {/* Số điện thoại (liên hệ) */}
                            <div>
                                <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại (liên hệ)</label>
                                <input type="tel" id="contactPhone" name="contactPhone" value={formData.contactPhone} onChange={handleProfileChange}
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

                <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">{initialData.agentName}</h2>
                
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