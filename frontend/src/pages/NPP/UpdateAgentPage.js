import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useTranslation } from 'react-i18next';

const UpdateAgentPage = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Lấy id của đại lý từ URL
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        username: '',
        address: '', // Giả sử địa chỉ chưa có trong DB, sẽ không được lưu
        phone: '',
        paymentMethod: '', // Giả sử chưa có trong DB
        email: '',
        accountInfo: '', // Giả sử chưa có trong DB
        notes: '' // Giả sử chưa có trong DB
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchAgentData = async () => {
            try {
                const response = await axiosClient.get(`/users/${id}`);
                const { username, email, phone } = response.data;
                setFormData(prevState => ({
                    ...prevState,
                    username,
                    email,
                    phone: phone || ''
                }));
            } catch (error) {
                console.error("Lỗi khi tải thông tin đại lý:", error);
                setMessage(t('npp.updateAgent.loadingError'));
            } finally {
                setLoading(false);
            }
        };

        fetchAgentData();
    }, [id, t]);

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

        try {
            const userDataToUpdate = {
                username: formData.username,
                email: formData.email,
                phone: formData.phone,
                role_id: 3 // Vẫn giữ vai trò là Đại lý
            };
            await axiosClient.put(`/users/${id}`, userDataToUpdate);
            
            const agentDataToUpdate = {
                diachi: formData.address, 
            };

            if (Object.keys(agentDataToUpdate).length > 0) {
                await axiosClient.put(`/agent/updateAgent/${id}`, agentDataToUpdate);
            }
            
            setMessage(t('npp.updateAgent.updateSuccess'));
            setTimeout(() => navigate('/agent'), 1500);

        } catch (error) {
            console.error("Lỗi khi cập nhật đại lý:", error);
            // Hiển thị thông báo chi tiết hơn nếu có thể
            const detailedError = error.response?.data?.error || error.response?.data?.message || t('npp.updateAgent.updateError');
            setMessage(detailedError);
        }
    };
    
    if (loading) {
        return <div className="text-center p-10">{t('general.loading')}</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6 dark:text-white">{t('npp.updateAgent.title')}</h1>

            <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto dark:bg-gray-800 dark:border dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-700 dark:text-white">{t('npp.updateAgent.formTitle')}</h2>
                <p className="text-sm text-gray-500 mt-1 mb-8 dark:text-gray-400">
                   {t('npp.updateAgent.formDesc')}
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {/* Tên đại lý */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">{t('npp.addAgent.agentNameLabel')}</label>
                            <input type="text" name="username" id="username" value={formData.username} onChange={handleChange} placeholder={t('npp.addAgent.agentNamePlaceholder')} className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600" required />
                        </div>
                        {/* Địa chỉ */}
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">{t('npp.addAgent.addressLabel')}</label>
                            <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} placeholder={t('npp.addAgent.addressPlaceholder')} className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600" />
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
                                <option value="">{t('npp.addAgent.paymentMethodPlaceholder')}</option>
                                <option value="bank">{t('npp.addAgent.bankTransfer')}</option>
                                <option value="paypal">{t('npp.addAgent.paypal')}</option>
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
                            <p className="text-xs text-gray-400 mt-1">{t('npp.addAgent.accountInfoDesc')}</p>
                        </div>
                        {/* Ghi chú */}
                        <div className="md:col-span-2">
                             <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">{t('npp.addAgent.notesLabel')}</label>
                             <textarea name="notes" id="notes" rows="4" value={formData.notes} onChange={handleChange} placeholder={t('npp.addAgent.notesPlaceholder')} className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600"></textarea>
                        </div>
                    </div>

                    {message && <p className={`text-center mt-4 ${message.includes(t('npp.updateAgent.updateSuccess')) ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}

                    <div className="flex justify-end gap-4 mt-8">
                        <button 
                            type="button"
                            onClick={() => navigate('/npp/agents')} 
                            className="bg-red-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-600 transition-colors"
                        >
                            {t('general.cancel')}
                        </button>
                        <button 
                            type="submit"
                            className="bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 transition-colors"
                        >
                            {t('general.update')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateAgentPage;