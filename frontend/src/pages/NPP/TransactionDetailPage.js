import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Component InfoField với dark mode
const InfoField = ({ label, value }) => (
    <div>
        <label className="block text-sm font-medium text-gray-500 mb-1 dark:text-gray-400">{label}</label>
        <div className="bg-gray-100 p-3 rounded-md text-gray-800 font-semibold min-h-[44px] flex items-center dark:bg-gray-700 dark:text-gray-200">
            {value}
        </div>
    </div>
);

// Component StatusBadge với dark mode
const StatusBadge = ({ status }) => {
    const { t } = useTranslation();
    const statusStyles = {
        success: { text: t('status.success'), color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700' },
        failed: { text: t('status.failed'), color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700' },
    };
    const style = statusStyles[status] || {};
    return (
        <div>
            <label className="block text-sm font-medium text-gray-500 mb-1 dark:text-gray-400">{t('npp.transactionDetail.statusLabel')}</label> {/* Sửa lại label */}
            <div className={`px-4 py-3 text-sm font-bold rounded-md inline-block border ${style.color}`}>
                {style.text}
            </div>
        </div>
    );
};

const TransactionDetailPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t, i18n } = useTranslation();
    
    // Giữ nguyên logic lấy state
    const { transactionData } = location.state || { transactionData: {} };

    const formatCurrency = (value) => {
        if (typeof value !== 'number') return value;
        return new Intl.NumberFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US', { style: 'currency', currency: 'VND' }).format(value);
    };

    // Giữ nguyên check không tìm thấy
    if (!transactionData.id) {
        return (
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-6 dark:text-white">{t('npp.transactionDetail.notFound')}</h1> 
                <Link to="/npp/balance" className="text-blue-500 hover:underline">{t('npp.transactionDetail.backToList')}</Link> 
            </div>
        )
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6 dark:text-white">{t('npp.transactionDetail.title')}</h1> 

            <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto dark:bg-gray-800 dark:border dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-700 mb-6 dark:text-white">{t('npp.transactionDetail.detailTitle')}</h2> 

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <InfoField label={t('npp.transactionDetail.transactionCodeLabel')} value={transactionData.id} /> 
                    <InfoField label={t('npp.transactionDetail.amountLabel')} value={formatCurrency(transactionData.transferAmount)} /> 
                    <InfoField label={t('npp.transactionDetail.paymentMethodLabel')} value={t('npp.addAgent.bankTransfer')} /> 
                    <InfoField label={t('npp.transactionDetail.accountNumberLabel')} value="8888888888" /> 
                    <StatusBadge status={transactionData.status} />
                    <InfoField label={t('npp.transactionDetail.transactionDateLabel')} value={`${transactionData.date}   ${transactionData.time}`} /> 
                    <div className="md:col-span-2">
                         <InfoField label={t('npp.transactionDetail.notesLabel')} value={transactionData.reason || t('npp.transactionDetail.notesDefault')} /> 
                    </div>
                </div>

                <div className="flex justify-end gap-4 mt-8">
                    <button
                        onClick={() => navigate('/npp/balance')}
                        className="bg-red-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-600 transition-colors"
                    >
                        {t('general.close')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TransactionDetailPage;