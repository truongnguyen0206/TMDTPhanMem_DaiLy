import { useState, useEffect } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useTranslation } from 'react-i18next';

const UpdateCTVPage = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // id này là ctv_id
    const { t, i18n } = useTranslation();
    const { setPageTitle } = useOutletContext();

    const [formData, setFormData] = useState({
        username: '', // Sẽ lấy từ ctv_name
        address: '',  // Sẽ lấy từ diachi
        phone: '',    // Sẽ trống
        email: '',    // Sẽ trống
        paymentMethod: '', 
        accountInfo: '',
        notes: ''
    });

    const [userId, setUserId] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        setPageTitle(t('dl.updateCtv.title'));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setPageTitle, t, i18n.language]);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                // BƯỚC 1: Dùng ctv_id (từ URL) để lấy thông tin CTV
                // API GET /CTV/getCTVById/:id (API NÀY VẪN HOẠT ĐỘNG)
                const ctvResponse = await axiosClient.get(`/CTV/getCTVById/${id}`);
                const ctvData = ctvResponse.data.data;
                
                if (!ctvData) {
                    throw new Error("Không tìm thấy thông tin CTV.");
                }

                // Lưu lại user_id để dùng khi Submit
                setUserId(ctvData.user_id); 

                // BƯỚC 2: BỎ QUA VIỆC GỌI API /users/:id (VÌ NÓ BỊ LỖI)
                // Chúng ta sẽ chỉ điền thông tin từ bảng CTV

                // BƯỚC 3: Gộp dữ liệu vào form
                setFormData(prevState => ({
                    ...prevState,
                    username: ctvData.ctv_name || '', // Lấy ctv_name
                    address: ctvData.diachi || '',  // Lấy địa chỉ
                    // Email và Phone sẽ rỗng, người dùng phải tự nhập
                    email: '', 
                    phone: ''
                }));

            } catch (error) {
                console.error(t('dl.updateCtv.errorLoading'), error);
                setMessage(t('dl.updateCtv.loadingError'));
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, t]); // Thêm t

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    // Hàm handleSubmit này VẪN HOẠT ĐỘNG
    // vì API PUT /users/updateUser/:id (BE) không bị lỗi
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (!userId) {
            setMessage("Lỗi: Không tìm thấy user_id để cập nhật.");
            return;
        }

        try {
            const userDataToUpdate = {
                username: formData.username,
                email: formData.email,
                phone: formData.phone,
                role_id: 4 
            };

            const ctvDataToUpdate = {
                ctv_name: formData.username,
                diachi: formData.address,
            };

            // API 1: Cập nhật bảng users (Hoạt động)
            await axiosClient.put(`/users/updateUser/${userId}`, userDataToUpdate);

            // API 2: Cập nhật bảng ctv (Hoạt động)
            await axiosClient.put(`/CTV/updateCTV/${id}`, ctvDataToUpdate);

            setMessage(t('dl.updateCtv.updateSuccess'));
            setTimeout(() => navigate('/dl/CTV'), 1500);

        } catch (error) {
            console.error(t('dl.updateCtv.errorUpdating'), error);
            const detailedError = error.response?.data?.message || t('dl.updateCtv.updateError');
            setMessage(detailedError);
        }
    };

    if (loading) {
        return <div className="text-center p-10 dark:text-gray-300">{t('general.loading')}</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6 dark:text-white">{t('dl.updateCtv.title')}</h1>
            <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto dark:bg-gray-800 dark:border dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-700 dark:text-white">{t('dl.updateCtv.formTitle')}</h2>
                <p className="text-sm text-gray-500 mt-1 mb-8 dark:text-gray-400">
                    {t('dl.updateCtv.formDesc')}
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {/* Tên CTV (lấy từ ctv_name) */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">{t('dl.addCtv.ctvNameLabel')}</label>
                            <input type="text" name="username" id="username" value={formData.username} onChange={handleChange} placeholder={t('dl.addCtv.ctvNamePlaceholder')} className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600" required />
                        </div>
                        {/* Địa chỉ */}
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">{t('dl.addCtv.addressLabel')}</label>
                            <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} placeholder={t('dl.addCtv.addressPlaceholder')} className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                        </div>
                        {/* Số điện thoại (Sẽ rỗng) */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">{t('npp.addAgent.phoneLabel')}</label>
                            <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} placeholder={t('npp.addAgent.phonePlaceholder')} className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600" required />
                        </div>
                        {/* Phương thức thanh toán */}
                        <div>
                            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">{t('npp.addAgent.paymentMethodLabel')}</label>
                            <select name="paymentMethod" id="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600">
                                <option value="bank">{t('npp.addAgent.bankTransfer')}</option>
                                <option value="paypal">{t('npp.addAgent.paypal')}</option>
                                <option value="cash">{t('npp.addAgent.cash')}</option>
                            </select>
                        </div>
                        {/* Địa chỉ email (Sẽ rỗng) */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">{t('npp.addAgent.emailLabel')}</label>
                            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} placeholder={t('npp.addAgent.emailPlaceholder')} className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600" required />
                        </div>
                        {/* Thông tin tài khoản */}
                        <div>
                            <label htmlFor="accountInfo" className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">{t('npp.addAgent.accountInfoLabel')}</label>
                            <input type="text" name="accountInfo" id="accountInfo" value={formData.accountInfo} onChange={handleChange} placeholder={t('npp.addAgent.accountInfoPlaceholder')} className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                            <p className="text-xs text-gray-400 mt-1 dark:text-gray-500">{t('npp.addAgent.accountInfoDesc')}</p>
                        </div>
                        {/* Ghi chú */}
                        <div className="md:col-span-2">
                             <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">{t('npp.addAgent.notesLabel')}</label>
                             <textarea name="notes" id="notes" rows="4" value={formData.notes} onChange={handleChange} placeholder={t('npp.addAgent.notesPlaceholder')} className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600"></textarea>
                        </div>
                    </div>

                    {message && <p className={`text-center mt-4 ${message.includes(t('dl.updateCtv.updateSuccess')) ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}

                    <div className="flex justify-end gap-4 mt-8">
                        <button
                            type="button"
                            onClick={() => navigate('/dl/CTV')}
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

export default UpdateCTVPage;