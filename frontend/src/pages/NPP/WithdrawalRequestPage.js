import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const WithdrawalRequestPage = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [formData, setFormData] = useState({
        amount: '',
        paymentMethod: '',
        accountInfo: '',
        notes: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Dữ liệu yêu cầu rút tiền:', formData);
        alert(t('npp.withdrawal.submitSuccess'));
        navigate('/npp/balance'); // Sửa lại đường dẫn quay về
    };
    const formatCurrency = (value) => {
        if (typeof value !== 'number') return value;
        return new Intl.NumberFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US', { style: 'currency', currency: 'VND' }).format(value);
    };

    // Giả lập số dư
    const availableBalance = 1000000;
    const minWithdrawal = 100000;

    return (
        <div>
            {/* Cập nhật tiêu đề */}
            <h1 className="text-3xl font-bold text-gray-800 mb-6 dark:text-white">{t('npp.withdrawal.title')}</h1>

            {/* Cập nhật container */}
            <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto dark:bg-gray-800 dark:border dark:border-gray-700">
                {/* Cập nhật tiêu đề và mô tả */}
                <h2 className="text-xl font-bold text-gray-700 dark:text-white">{t('npp.withdrawal.formTitle')}</h2>
                <p className="text-sm text-gray-500 mt-1 mb-8 dark:text-gray-400">
                    {t('npp.withdrawal.formDesc')}
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {/* Cập nhật các label, input, select, textarea */}
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">{t('npp.withdrawal.amountLabel')}</label>
                            <input type="number" name="amount" id="amount" value={formData.amount} onChange={handleChange} placeholder={t('npp.withdrawal.amountPlaceholder')} className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600" required />
                            <p className="text-xs text-gray-400 mt-1 dark:text-gray-500">
                                {/* Dịch và truyền biến */}
                                {t('npp.withdrawal.amountDesc', { available: formatCurrency(availableBalance), min: formatCurrency(minWithdrawal) })}
                            </p>
                        </div>
                        <div>
                            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">{t('npp.withdrawal.paymentMethodLabel')}</label>
                            <select name="paymentMethod" id="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600" required>
                                <option value="bank">{t('npp.addAgent.bankTransfer')}</option> {/* Dịch */}
                                <option value="paypal">{t('npp.addAgent.paypal')}</option> {/* Dịch */}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="accountInfo" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">{t('npp.withdrawal.accountInfoLabel')}</label> {/* Dịch */}
                            <input type="text" name="accountInfo" id="accountInfo" value={formData.accountInfo} onChange={handleChange} placeholder={t('npp.withdrawal.accountInfoPlaceholder')} className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600" required /> {/* Dịch */}
                            <p className="text-xs text-gray-400 mt-1 dark:text-gray-500">{t('npp.withdrawal.accountInfoDesc')}</p> {/* Dịch */}
                        </div>
                        {/* Ghi chú */}
                        <div className="md:col-span-2">
                             <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">{t('npp.withdrawal.notesLabel')}</label> {/* Dịch */}
                             <textarea name="notes" id="notes" rows="4" value={formData.notes} onChange={handleChange} placeholder={t('npp.withdrawal.notesPlaceholder')} className="w-full bg-gray-100 border-transparent rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600"></textarea> {/* Dịch */}
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-8">
                        <button
                            type="button"
                            onClick={() => navigate('/npp/balance')}
                            className="bg-red-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-600 transition-colors"
                        >
                            {t('general.cancel')} {/* Dịch */}
                        </button>
                        <button
                            type="submit"
                            className="bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 transition-colors"
                        >
                            {t('npp.withdrawal.submitButton')} {/* Dịch */}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WithdrawalRequestPage;