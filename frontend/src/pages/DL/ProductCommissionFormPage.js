import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import useTranslation

// Component InfoField với dark mode
const InfoField = ({ label, value }) => (
    <div>
        <label className="block text-sm font-medium text-gray-500 mb-1 dark:text-gray-400">{label}</label>
        <div className="bg-gray-100 p-3 rounded-md text-gray-800 font-semibold min-h-[44px] flex items-center dark:bg-gray-700 dark:text-gray-200">
            {value}
        </div>
    </div>
);

const ProductCommissionFormPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { setPageTitle } = useOutletContext();
    const { t, i18n } = useTranslation(); // Lấy t và i18n

    const { productData } = location.state || { productData: {
        id: '', // Mặc định rỗng
        name: '',
        currentCommissionPercent: '',
        currentCommissionType: ''
    }};

    const [formData, setFormData] = useState({
        commissionMethod: productData.currentCommissionType || '',
        commissionValue: productData.currentCommissionPercent || '',
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Dịch tiêu đề trang (sử dụng key đã thêm vào file dịch)
        setPageTitle(t('dl.productCommission.pageTitle', { productName: productData.name || '...' }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setPageTitle, productData.name, t, i18n.language]); // Thêm i18n.language

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        console.log('Cập nhật hoa hồng:', { productId: productData.id, ...formData });
        try {
            // await axiosClient.put(`/products/${productData.id}/commission`, formData);
            // Dịch thông báo thành công
            setMessage(t('dl.productCommission.updateSuccess'));
            setTimeout(() => navigate('/dl/products'), 1500);
        } catch (error) {
             // Dịch log lỗi
            console.error(t('dl.productCommission.errorUpdating'), error);
            // Dịch thông báo lỗi
            setMessage(t('dl.productCommission.updateError'));
        }
    };

    return (
        <div>
             {/* Dịch tiêu đề H1 */}
            <h1 className="text-3xl font-bold text-gray-800 mb-6 dark:text-white">{t('dl.productCommission.title')}</h1>

            <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto dark:bg-gray-800 dark:border dark:border-gray-700">
                 {/* Dịch tiêu đề form */}
                <h2 className="text-xl font-bold text-gray-700 mb-6 dark:text-white">{t('dl.productCommission.formTitle')}</h2>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Dịch label */}
                            <InfoField label={t('dl.productCommission.productCodeLabel')} value={productData.id} />
                            {/* Dịch label */}
                            <InfoField label={t('dl.productCommission.productNameLabel')} value={productData.name} />
                        </div>

                        <div>
                            {/* Dịch label */}
                            <label htmlFor="commissionMethod" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">{t('dl.productCommission.methodLabel')}</label>
                            <select
                                name="commissionMethod"
                                id="commissionMethod"
                                value={formData.commissionMethod}
                                onChange={handleChange}
                                className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                required
                            >
                                {/* Dịch placeholder */}
                                <option value="">{t('dl.productCommission.methodPlaceholder')}</option>
                                 {/* Dịch option */}
                                <option value="percent">{t('dl.productCommission.methodPercent')}</option>
                                {/* Dịch option */}
                                <option value="fixed">{t('dl.productCommission.methodFixed')}</option>
                            </select>
                        </div>

                        <div>
                            {/* Dịch label động bằng context */}
                            <label htmlFor="commissionValue" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                                {t('dl.productCommission.valueLabel', { context: formData.commissionMethod || 'none' })}
                            </label>
                            <input
                                type="text"
                                name="commissionValue"
                                id="commissionValue"
                                value={formData.commissionValue}
                                onChange={handleChange}
                                 // Dịch placeholder động bằng context
                                placeholder={t('dl.productCommission.valuePlaceholder', { context: formData.commissionMethod || 'none' })}
                                className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                required
                            />
                            {formData.commissionMethod === 'fixed' && (
                                 // Dịch ví dụ
                                <p className="text-xs text-gray-400 mt-1 dark:text-gray-500">{t('dl.productCommission.valueExampleFixed')}</p>
                            )}
                        </div>
                    </div>

                    {/* So sánh message với key dịch */}
                    {message && <p className={`text-center mt-4 ${message.includes(t('dl.productCommission.updateSuccess')) ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}

                    <div className="flex justify-end gap-4 mt-8">
                        <button
                            type="button"
                            onClick={() => navigate(-1)} // Quay lại trang trước
                            className="bg-red-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-600 transition-colors"
                        >
                            {t('general.cancel')} {/* Dịch nút Hủy */}
                        </button>
                        <button
                            type="submit"
                            className="bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 transition-colors"
                        >
                            {t('general.update')} {/* Dịch nút Cập nhật */}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductCommissionFormPage;