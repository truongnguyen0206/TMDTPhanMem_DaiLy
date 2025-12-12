import React, { useEffect } from 'react'; // Import useEffect
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { useOutletContext } from 'react-router-dom'; // Import useOutletContext

// Component InfoField (Giữ nguyên)
const InfoField = ({ label, value }) => (
    <div>
        <label className="block text-sm font-medium text-gray-500 mb-1 dark:text-gray-400">{label}</label>
        <div className="bg-gray-100 p-3 rounded-md text-gray-800 font-semibold min-h-[44px] flex items-center dark:bg-gray-700 dark:text-gray-200">
            {value}
        </div>
    </div>
);

// Component StatusBadge (Dịch text)
const StatusBadge = ({ status }) => {
    const { t } = useTranslation(); // Lấy hàm t
    const statusStyles = {
        success: { text: t('status.success'), color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700' }, // Dịch [cite: locales/vi/translation.json, locales/en/translation.json]
        failed: { text: t('status.failed'), color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700' }, // Dịch [cite: locales/vi/translation.json, locales/en/translation.json]
    };
    const style = statusStyles[status] || {};
     // Fallback nếu không có key dịch
    const textToShow = style.text || status || t('status.unknown'); // [cite: locales/vi/translation.json, locales/en/translation.json]
    return (
        <div>
            {/* Dịch label [cite: locales/vi/translation.json, locales/en/translation.json] */}
            <label className="block text-sm font-medium text-gray-500 mb-1 dark:text-gray-400">{t('dl.transactionDetail.statusLabel')}</label>
            <div className={`px-4 py-3 text-sm font-bold rounded-md inline-block border ${style.color || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600'}`}>
                {textToShow}
            </div>
        </div>
    );
};

const TransactionDetailPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t, i18n } = useTranslation(); // Lấy t và i18n
    const { setPageTitle } = useOutletContext(); // Lấy setPageTitle

    const { transactionData } = location.state || { transactionData: {} };

    // Cập nhật tiêu đề trang khi component mount hoặc ngôn ngữ thay đổi
    useEffect(() => {
        // Sử dụng key dịch [cite: locales/vi/translation.json, locales/en/translation.json]
        setPageTitle(t('dl.transactionDetail.title'));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setPageTitle, t, i18n.language]); // Thêm dependencies

    // Format tiền tệ dựa trên ngôn ngữ hiện tại
    const formatCurrency = (value) => {
        if (typeof value !== 'number') return value;
        return new Intl.NumberFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US', { style: 'currency', currency: 'VND' }).format(value);
    };

    if (!transactionData.id) {
        return (
            <div>
                 {/* Dịch thông báo lỗi [cite: locales/vi/translation.json, locales/en/translation.json] */}
                <h1 className="text-3xl font-bold text-gray-800 mb-6 dark:text-white">{t('dl.transactionDetail.notFound')}</h1>
                {/* Dịch link quay lại [cite: locales/vi/translation.json, locales/en/translation.json] */}
                <Link to="/dl/balance" className="text-blue-500 hover:underline">{t('dl.transactionDetail.backToList')}</Link>
            </div>
        )
    }

    return (
        <div>
            {/* Dịch tiêu đề H1 [cite: locales/vi/translation.json, locales/en/translation.json] */}
            <h1 className="text-3xl font-bold text-gray-800 mb-6 dark:text-white">{t('dl.transactionDetail.title')}</h1>

            <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto dark:bg-gray-800 dark:border dark:border-gray-700">
                {/* Dịch tiêu đề H2 [cite: locales/vi/translation.json, locales/en/translation.json] */}
                <h2 className="text-xl font-bold text-gray-700 mb-6 dark:text-white">{t('dl.transactionDetail.detailTitle')}</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                     {/* Dịch label [cite: locales/vi/translation.json, locales/en/translation.json] */}
                    <InfoField label={t('dl.transactionDetail.transactionCodeLabel')} value={transactionData.id} />
                     {/* Dịch label [cite: locales/vi/translation.json, locales/en/translation.json] */}
                    <InfoField label={t('dl.transactionDetail.amountLabel')} value={formatCurrency(transactionData.transferAmount)} />
                     {/* Dịch label và value [cite: locales/vi/translation.json, locales/en/translation.json] */}
                    <InfoField label={t('dl.transactionDetail.paymentMethodLabel')} value={t('npp.addAgent.bankTransfer')} />
                     {/* Dịch label [cite: locales/vi/translation.json, locales/en/translation.json] */}
                    <InfoField label={t('dl.transactionDetail.accountNumberLabel')} value="8888888888" />
                    <StatusBadge status={transactionData.status} /> {/* Đã dịch bên trong component */}
                     {/* Dịch label [cite: locales/vi/translation.json, locales/en/translation.json] */}
                    <InfoField label={t('dl.transactionDetail.transactionDateLabel')} value={`${new Date(transactionData.date).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}   ${transactionData.time}`} /> {/* Format ngày */}
                    <div className="md:col-span-2">
                         {/* Dịch label và value mặc định [cite: locales/vi/translation.json, locales/en/translation.json] */}
                         <InfoField label={t('dl.transactionDetail.notesLabel')} value={transactionData.reason || t('dl.transactionDetail.notesDefault')} />
                    </div>
                </div>

                <div className="flex justify-end gap-4 mt-8">
                    <button
                        onClick={() => navigate('/dl/balance')} // Sửa link quay lại
                        className="bg-red-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-600 transition-colors"
                    >
                         {/* Dịch nút Đóng [cite: locales/vi/translation.json, locales/en/translation.json] */}
                        {t('general.close')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TransactionDetailPage;
