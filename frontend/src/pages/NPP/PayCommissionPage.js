import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import

// Component InfoField (Giữ nguyên)
const InfoField = ({ label, value }) => (
    <div>
        <label className="block text-sm font-medium text-gray-500 mb-1 dark:text-gray-400">{label}</label>
        <div className="bg-gray-100 p-3 rounded-md text-gray-800 font-semibold min-h-[44px] flex items-center dark:bg-gray-700 dark:text-gray-200">
            {value}
        </div>
    </div>
);

const PayCommissionPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t, i18n } = useTranslation(); // Lấy t và i18n

    const { commissionData } = location.state || { commissionData: {} };
    const isPaid = commissionData.status === 'paid';

    const formatCurrency = (value) => {
        if (typeof value !== 'number') return value;
        return new Intl.NumberFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US', { style: 'currency', currency: 'VND' }).format(value);
    };

    if (!commissionData.id) {
        return (
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-6 dark:text-white">{t('npp.payCommission.notFound')}</h1> {/* Dịch */}
                <button onClick={() => navigate('/npp/commissions')} className="text-blue-500 hover:underline">{t('npp.payCommission.backToList')}</button> {/* Dịch */}
            </div>
        )
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6 dark:text-white">{t('npp.payCommission.title')}</h1> {/* Dịch */}

            <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto dark:bg-gray-800 dark:border dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-700 mb-6 dark:text-white">
                    {isPaid ? t('npp.payCommission.paidDetailTitle') : t('npp.payCommission.payTitle')} {/* Dịch */}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <InfoField label={t('npp.payCommission.commissionCodeLabel')} value={commissionData.id} /> {/* Dịch */}
                    <InfoField label={t('npp.payCommission.agentLabel')} value={commissionData.agent} /> {/* Dịch */}
                    <InfoField label={t('npp.payCommission.amountLabel')} value={formatCurrency(commissionData.amount)} /> {/* Dịch */}
                    <InfoField label={t('npp.payCommission.paymentMethodLabel')} value={t('npp.addAgent.bankTransfer')} /> {/* Dịch */}
                    <InfoField label={t('npp.payCommission.accountNumberLabel')} value="8888888888" /> {/* Dịch */}
                    <InfoField label={t('npp.payCommission.transactionDateLabel')} value={`${commissionData.date}   ${commissionData.time}`} /> {/* Dịch */}
                </div>
                <div className="col-span-2">
                     <InfoField label={t('npp.payCommission.notesLabel')} value={t('npp.payCommission.notesDefault', { agentName: commissionData.agent })} /> {/* Dịch */}
                </div>

                <div className="flex justify-end gap-4 mt-8">
                    <button
                        onClick={() => navigate('/npp/commissions')}
                        className="bg-gray-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-600 transition-colors dark:bg-gray-600 dark:hover:bg-gray-500"
                    >
                        {isPaid ? t('general.back') : t('general.close')} {/* Dịch */}
                    </button>
                    <button
                        onClick={() => alert(t('npp.payCommission.payConfirm', {amount: formatCurrency(commissionData.amount), agentName: commissionData.agent}))} // Dịch alert
                        disabled={isPaid}
                        className={`font-bold py-2 px-6 rounded-lg transition-colors
                                    ${isPaid
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                                        : 'bg-green-500 text-white hover:bg-green-600'
                                    }`}
                    >
                        {isPaid ? t('npp.payCommission.paidButton') : t('npp.payCommission.payButton')} {/* Dịch */}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PayCommissionPage;