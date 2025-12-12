import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; 
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

const AddCTVPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user } = useAuth();
    const [agentId, setAgentId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        paymentMethod: 'bank',
        email: '',
        accountInfo: '',
        notes: ''
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchAgentId = async () => {
            if (user && user.id) {
                try {
                    // Gọi API lấy danh sách agent để tìm agent_id của user hiện tại
                    // (Lưu ý: Cách này hơi chậm nếu DB lớn, nhưng tuân thủ không sửa BE)
                    const response = await axiosClient.get('/agent/getAllAgents');
                    const currentAgent = response.data.find(a => a.user_id === user.id);
                    if (currentAgent) {
                        setAgentId(currentAgent.agent_id);
                    }
                } catch (error) {
                    console.error("Lỗi lấy thông tin đại lý:", error);
                }
            }
        };
        fetchAgentId();
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);

        if (!agentId) {
            alert("Không tìm thấy thông tin Đại lý quản lý. Vui lòng thử lại.");
            setLoading(false);
            return;
        }

        try {
            // --- BƯỚC 1: Tạo tài khoản User (để đăng nhập) ---
            const userPayload = {
                username: formData.name, // Dùng tên làm username tạm
                email: formData.email,
                password: '123456', // Mật khẩu mặc định (vì form không có ô nhập pass)
                phone: formData.phone,
                role_id: 4 // Role ID cho Cộng tác viên (dựa theo user_controller)
            };

            const userRes = await axiosClient.post('/users/createUser', userPayload);
            
            // Backend trả về: { message: "...", user: { user_id: ... } }
            // Cần kiểm tra kỹ response user_controller trả về data nằm ở đâu
            const newUserId = userRes.data.user?.user_id || userRes.data.user?.id;

            if (!newUserId) {
                throw new Error("Tạo User thành công nhưng không lấy được ID.");
            }

            // --- BƯỚC 2: Tạo hồ sơ CTV ---
            const ctvPayload = {
                user_id: newUserId,
                ctv_name: formData.name,
                diachi: formData.address,
                agent_id: agentId, // ID của đại lý đang đăng nhập
                ngaythamgia: new Date().toISOString()
            };

            await axiosClient.post('/CTV/createCTV', ctvPayload);

            alert("Thêm cộng tác viên thành công!");
            navigate('/dl/CTV');

        } catch (error) {
            console.error("Lỗi khi thêm CTV:", error);
            const errorMsg = error.response?.data?.message || error.message || "Có lỗi xảy ra.";
            setMessage(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6 dark:text-white">{t('dl.addCtv.title')}</h1>
            <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto dark:bg-gray-800 dark:border dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-700 dark:text-white">{t('dl.addCtv.formTitle')}</h2>
                <p className="text-sm text-gray-500 mt-1 mb-8 dark:text-gray-400">
                    {t('dl.addCtv.formDesc')}
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">{t('dl.addCtv.ctvNameLabel')}</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} placeholder={t('dl.addCtv.ctvNamePlaceholder')} className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600" required />
                        </div>
                        {/* Địa chỉ */}
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">{t('dl.addCtv.addressLabel')}</label>
                            <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} placeholder={t('dl.addCtv.addressPlaceholder')} className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                        </div>
                        {/* Số điện thoại */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">{t('npp.addAgent.phoneLabel')}</label>
                            <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} placeholder={t('npp.addAgent.phonePlaceholder')} className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600" required />
                        </div>
                        {/* Phương thức thanh toán */}
                        <div>
                            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">{t('npp.addAgent.paymentMethodLabel')}</label>
                            <select name="paymentMethod" id="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600">
                                {/* <option value="">{t('npp.addAgent.paymentMethodPlaceholder')}</option> */}
                                <option value="bank">{t('npp.addAgent.bankTransfer')}</option>
                                <option value="paypal">{t('npp.addAgent.paypal')}</option>
                                <option value="cash">{t('npp.addAgent.cash')}</option>
                            </select>
                        </div>
                        {/* Địa chỉ email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">{t('npp.addAgent.emailLabel')}</label>
                            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} placeholder={t('npp.addAgent.emailPlaceholder')} className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600" required />
                        </div>
                        {/* Thông tin tài khoản */}
                        <div>
                            <label htmlFor="accountInfo" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">{t('npp.addAgent.accountInfoLabel')}</label>
                            <input type="text" name="accountInfo" id="accountInfo" value={formData.accountInfo} onChange={handleChange} placeholder={t('npp.addAgent.accountInfoPlaceholder')} className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                            <p className="text-xs text-gray-400 mt-1 dark:text-gray-500">{t('npp.addAgent.accountInfoDesc')}</p>
                        </div>
                        {/* Ghi chú */}
                        <div className="md:col-span-2">
                             <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">{t('npp.addAgent.notesLabel')}</label>
                             <textarea name="notes" id="notes" rows="4" value={formData.notes} onChange={handleChange} placeholder={t('npp.addAgent.notesPlaceholder')} className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600"></textarea>
                        </div>
                    </div>

                    {message && <p className={`text-center mt-4 ${message.includes('thành công') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}

                    <div className="flex justify-end gap-4 mt-8">
                        <button
                            type="button"
                            onClick={() => navigate('/dl/CTV')}
                            className="bg-red-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-600 transition-colors"
                            disabled={loading}
                        >
                            {t('general.cancel')}
                        </button>
                        <button
                            type="submit"
                            className="bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 transition-colors flex items-center"
                            disabled={loading}
                        >
                            {loading ? 'Đang xử lý...' : t('dl.addCtv.submitButton')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default AddCTVPage