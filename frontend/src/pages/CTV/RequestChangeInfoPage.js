import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Component con để hiển thị thông tin BỊ KHÓA
const InfoFieldLocked = ({ label, value }) => (
    <div>
        <label className="block text-sm font-medium text-gray-500 mb-1">{label}</label>
        <div className="bg-gray-200 p-3 rounded-md text-gray-600 font-medium min-h-[44px] flex items-center cursor-not-allowed" title="Thông tin này bị khóa và cần Admin duyệt để thay đổi.">
            {value || 'N/A'}
        </div>
    </div>
);

const RequestChangeInfoPage = () => {
    const { setPageTitle } = useOutletContext();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Thông tin pháp lý hiện tại (bị khóa)
    const [legalData] = useState({
        legalName: user?.username || 'Nguyễn Văn A',
        cccd: '001234567890',
        loginEmail: user.email || 'ctv@email.com',
    });

    // Thông tin yêu cầu thay đổi
    const [formData, setFormData] = useState({
        reason: '',
        // Bạn có thể thêm các trường mới nếu muốn CTV tự nhập,
        // nhưng theo nghiệp vụ KYC thì họ chỉ nên gửi lý do và Admin sẽ tự cập nhật.
        // newLegalName: '', 
        // newCccd: '',
    });
    
    const [message, setMessage] = useState('');

    useEffect(() => {
        setPageTitle('Yêu cầu thay đổi thông tin pháp lý');
    }, [setPageTitle]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.reason) {
            setMessage('Vui lòng nhập lý do thay đổi.');
            return;
        }

        // Giả lập gửi yêu cầu
        console.log('Đã gửi yêu cầu thay đổi thông tin pháp lý:', {
            currentUser: legalData,
            reason: formData.reason
        });
        
        setMessage('Đã gửi yêu cầu thành công. Admin sẽ sớm xem xét.');
        alert('Đã gửi yêu cầu thành công!');
        
        setTimeout(() => {
            navigate('/ctv/profile'); // Quay về trang profile chính
        }, 1500);
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-md max-w-3xl mx-auto border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Yêu cầu thay đổi thông tin pháp lý</h2>
            <p className="text-sm text-gray-500 mb-6">
                Những thông tin này dùng để xác minh (KYC) và trả hoa hồng. Mọi thay đổi cần được Admin duyệt.
            </p>

            <form className="space-y-6" onSubmit={handleSubmit}>
                <h3 className="text-lg font-semibold text-gray-700">Thông tin hiện tại (Đang bị khóa)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoFieldLocked label="Họ và Tên (Pháp lý)" value={legalData.legalName} />
                    <InfoFieldLocked label="Số CCCD/CMND" value={legalData.cccd} />
                    <div className="md:col-span-2">
                        <InfoFieldLocked label="Email/SĐT đăng nhập" value={legalData.loginEmail} />
                    </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-700 pt-4 border-t">Nội dung yêu cầu</h3>

                <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">Lý do thay đổi <span className="text-red-500">*</span></label>
                    <textarea 
                        id="reason" 
                        name="reason" 
                        rows="4" 
                        value={formData.reason} 
                        onChange={handleChange}
                        placeholder="Ví dụ: Tôi đã thay đổi CCCD mới, tôi bị sai tên ngân hàng..."
                        className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                    />
                </div>
                
                {/* (Tùy chọn) Thêm mục upload ảnh minh chứng */}
                {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh minh chứng (CCCD, ...)</label>
                    <input type="file" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                </div> */}

                {message && (
                    <p className="text-center text-green-600">{message}</p>
                )}

                <div className="flex justify-end gap-4 pt-6 border-t">
                    <button
                        type="button"
                        onClick={() => navigate('/ctv/profile')}
                        className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        className="bg-yellow-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-yellow-600 transition-colors"
                    >
                        Gửi yêu cầu
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RequestChangeInfoPage;