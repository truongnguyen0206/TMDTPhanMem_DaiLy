import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { LuPencil, LuSearch } from 'react-icons/lu';
import { useTranslation } from 'react-i18next'; // Import useTranslation

// Dữ liệu mẫu (giữ nguyên)
const mockProducts = [
    { id: 59217, name: 'Sản phẩm A', commission: '5%', status: 'active', reason: '', distributionDate: '01/05/2025', lastUpdateDate: '01/05/2025' },
    { id: 59218, name: 'Sản phẩm B', commission: '10,000VND', status: 'active', reason: '', distributionDate: '01/05/2025', lastUpdateDate: '01/05/2025' },
    { id: 59219, name: 'Sản phẩm C', commission: '20,000VND', status: 'active', reason: '', distributionDate: '01/05/2025', lastUpdateDate: '01/05/2025' },
    { id: 59220, name: 'Sản phẩm D', commission: '10%', status: 'inactive', reason: 'Ngừng kinh doanh', distributionDate: '01/05/2025', lastUpdateDate: '01/05/2025' },
    { id: 59221, name: 'Sản phẩm E', commission: '20,000VND', status: 'inactive', reason: 'Nhà phân phối ngừng cung cấp', distributionDate: '01/05/2025', lastUpdateDate: '01/05/2025' },
    { id: 59222, name: 'Sản phẩm F', commission: '2%', status: 'active', reason: '', distributionDate: '01/05/2025', lastUpdateDate: '01/05/2025' },
    { id: 59223, name: 'Sản phẩm G', commission: '10,000VND', status: 'active', reason: '', distributionDate: '01/05/2025', lastUpdateDate: '01/05/2025' },
    { id: 59224, name: 'Sản phẩm H', commission: '15,000VND', status: 'active', reason: '', distributionDate: '01/05/2025', lastUpdateDate: '01/05/2025' },
    { id: 59225, name: 'Sản phẩm I', commission: '20,000VND', status: 'active', reason: '', distributionDate: '01/05/2025', lastUpdateDate: '01/05/2025' },
];

// Component StatusBadge (Dịch text)
const StatusBadge = ({ status }) => {
    const { t } = useTranslation(); // Lấy hàm t
    const statusStyles = {
        active: { text: t('status.active'), color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' }, // Dịch text [cite: locales/vi/translation.json, locales/en/translation.json]
        inactive: { text: t('status.inactive'), color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' }, // Dịch text [cite: locales/vi/translation.json, locales/en/translation.json]
    };
    const style = statusStyles[status] || {};
    // Fallback nếu không có key dịch
    const textToShow = style.text || status || t('status.unknown'); // [cite: locales/vi/translation.json, locales/en/translation.json]
    return <span className={`px-3 py-1 text-xs font-bold rounded-full ${style.color || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>{textToShow}</span>;
};

const ProductPage = () => {
    const { setPageTitle } = useOutletContext();
    const { t, i18n } = useTranslation(); // Lấy t và i18n
    const [products] = useState(mockProducts);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const totalPages = 10;
    const ITEMS_PER_PAGE = 10; // Giả định số lượng item mỗi trang

    useEffect(() => {
        // Dịch tiêu đề trang [cite: locales/vi/translation.json, locales/en/translation.json]
        setPageTitle(t('sidebar.products'));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setPageTitle, t, i18n.language]); // Thêm i18n.language

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    };

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return products;
        const lowercasedFilter = searchTerm.toLowerCase();
        return products.filter(item =>
            item.name.toLowerCase().includes(lowercasedFilter) ||
            item.id.toString().includes(lowercasedFilter)
        );
    }, [products, searchTerm]);

     // Phân trang cho filteredProducts
     const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredProducts.slice(startIndex, endIndex);
    }, [filteredProducts, currentPage]);

    // Cập nhật Pagination (giữ nguyên logic)
    const renderPagination = () => {
         if (totalPages <= 1) return null;
         const pages = [];
         const maxPagesToShow = 5;
         let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
         let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
         if (endPage - startPage + 1 < maxPagesToShow) {
             startPage = Math.max(1, endPage - maxPagesToShow + 1);
         }
         const buttonClass = `px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 border dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600`;
         const activeButtonClass = ` px-3 py-1 rounded-md bg-primary text-white`;

         if (startPage > 1) {
             pages.push(<button key={1} onClick={() => setCurrentPage(1)} className={buttonClass}>1</button>);
             if (startPage > 2) {
                 pages.push(<span key="dots-start" className="px-3 py-1 dark:text-gray-400">...</span>);
             }
         }
         for (let i = startPage; i <= endPage; i++) {
             pages.push(
                 <button
                     key={i}
                     onClick={() => setCurrentPage(i)}
                     className={`${currentPage === i ? activeButtonClass : buttonClass}`}
                 >
                     {i}
                 </button>
             );
         }
         if (endPage < totalPages) {
             if (endPage < totalPages - 1) {
                 pages.push(<span key="dots-end" className="px-3 py-1 dark:text-gray-400">...</span>);
             }
             pages.push(<button key={totalPages} onClick={() => setCurrentPage(totalPages)} className={buttonClass}>{totalPages}</button>);
         }
         return pages;
    };


    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                <div className="mb-6">
                     <div className="relative">
                        <input
                            type="text"
                             // Dịch placeholder [cite: locales/vi/translation.json, locales/en/translation.json]
                            placeholder={t('dl.products.searchPlaceholder')}
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full md:w-96 bg-gray-50 border border-gray-200 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    </div>
                </div>
                {/* Dịch tiêu đề bảng [cite: locales/vi/translation.json, locales/en/translation.json] */}
                <h2 className="text-lg font-bold text-gray-800 mb-4 dark:text-white">{t('dl.products.listTitle')}</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                 {/* Dịch header [cite: locales/vi/translation.json, locales/en/translation.json] */}
                                <th className="px-6 py-3">{t('dl.products.idHeader')}</th>
                                 {/* Dịch header [cite: locales/vi/translation.json, locales/en/translation.json] */}
                                <th className="px-6 py-3">{t('dl.products.nameHeader')}</th>
                                 {/* Dịch header [cite: locales/vi/translation.json, locales/en/translation.json] */}
                                <th className="px-6 py-3">{t('dl.products.commissionHeader')}</th>
                                 {/* Dịch header [cite: locales/vi/translation.json, locales/en/translation.json] */}
                                <th className="px-6 py-3">{t('dl.products.statusHeader')}</th>
                                 {/* Dịch header [cite: locales/vi/translation.json, locales/en/translation.json] */}
                                <th className="px-6 py-3">{t('dl.products.reasonHeader')}</th>
                                 {/* Dịch header [cite: locales/vi/translation.json, locales/en/translation.json] */}
                                <th className="px-6 py-3">{t('dl.products.distributedDateHeader')}</th>
                                 {/* Dịch header [cite: locales/vi/translation.json, locales/en/translation.json] */}
                                <th className="px-6 py-3">{t('dl.products.lastUpdateHeader')}</th>
                                <th className="px-6 py-3 text-center"></th>
                            </tr>
                        </thead>
                        <tbody>
                             {/* Sử dụng paginatedProducts */}
                            {paginatedProducts.map(product => (
                                <tr key={product.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{product.id}</td>
                                    <td className="px-6 py-4 dark:text-gray-300">{product.name}</td>
                                    <td className="px-6 py-4 dark:text-gray-300">{product.commission}</td>
                                    <td className="px-6 py-4"><StatusBadge status={product.status} /></td>
                                    <td className="px-6 py-4 text-xs dark:text-gray-400">{product.reason}</td>
                                     {/* Format ngày theo ngôn ngữ */}
                                    <td className="px-6 py-4 dark:text-gray-300">{new Date(product.distributionDate).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')} <span className="text-gray-400 dark:text-gray-500">2:53PM</span></td>
                                    <td className="px-6 py-4 dark:text-gray-300">{new Date(product.lastUpdateDate).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')} <span className="text-gray-400 dark:text-gray-500">2:53PM</span></td>
                                    <td className="px-6 py-4 text-center">
                                        <Link
                                            to={`/dl/products/commission/edit/${product.id}`}
                                            state={{ productData: product }}
                                            className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-500"
                                        >
                                            <LuPencil size={18} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            
                        </tbody>
                    </table>
                </div>

                 <div className="flex justify-between items-center mt-6">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {/* Dịch text phân trang [cite: locales/vi/translation.json, locales/en/translation.json] */}
                         {t('general.showingResults', {
                             start: paginatedProducts.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0,
                             end: (currentPage - 1) * ITEMS_PER_PAGE + paginatedProducts.length,
                             total: filteredProducts.length // Tổng số sau khi lọc
                         })}
                    </p>
                    {totalPages > 1 && (
                        <div className="flex items-center gap-2">
                             {/* Thêm disabled và logic prev/next */}
                            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 border dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">{'<'}</button>
                            {renderPagination()}
                            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 border dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">{'>'}</button>
                        </div>
                    )}
                 </div>
            </div>
        </div>
    );
};

export default ProductPage;
