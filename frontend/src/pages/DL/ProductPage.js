import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { LuPencil, LuSearch } from 'react-icons/lu';
import { useTranslation } from 'react-i18next';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

const StatusBadge = ({ status }) => {
    const { t } = useTranslation();
    const statusStyles = {
        'true': { text: t('status.active'), color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
        'active': { text: t('status.active'), color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
        'false': { text: t('status.inactive'), color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
        'inactive': { text: t('status.inactive'), color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
    };
    const lowerStatus = String(status || 'NULL').toLowerCase();
    const style = statusStyles[lowerStatus] || {};
    const textToShow = style.text || status || t('status.unknown');
    return <span className={`px-3 py-1 text-xs font-bold rounded-full ${style.color || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>{textToShow}</span>;
};

const ProductPage = () => {
    const { setPageTitle } = useOutletContext();
    const { t, i18n } = useTranslation();
    const { user } = useAuth();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [agentId, setAgentId] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchAgentId = async () => {
            if (!user || !user.id) return;
            try {
                const response = await axiosClient.get('/agent/getAllAgents'); 
                const currentAgent = response.data.find(a => a.user_id === user.id);
                if (currentAgent) {
                    setAgentId(currentAgent.agent_id);
                } else {
                    console.warn("Không tìm thấy agent_id tương ứng với user_id.");
                }
            } catch (error) {
                console.error("Lỗi lấy thông tin đại lý:", error);
            }
        };
        fetchAgentId();
    }, [user]);

    useEffect(() => {
        setPageTitle(t('sidebar.products'));
        const fetchProducts = async () => {
            if (!agentId) {
                if (!loading) setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const response = await axiosClient.get(`/agent/${agentId}/products`);
                const rawProducts = response.data.data || []; 
                const mappedProducts = rawProducts.map(p => ({
                    id: p.ma_san_pham,
                    id1: p.agent_id,
                    name: p.ten_san_pham,
                    status: p.tinh_trang_san_pham,
                    reason: p.ly_do_ngung_hoat_dong || '-',
                    distributionDate: p.ngay_phanphoi,
                    lastUpdateDate: p.ngay_capnhat_gannhat,
                }));
                setProducts(mappedProducts);
            } catch (error) {
                console.error("Lỗi khi tải danh sách sản phẩm:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [agentId, setPageTitle, t, i18n.language]);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    };

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return products;
        const lowercasedFilter = searchTerm.toLowerCase();
        return products.filter(item =>
            item.name.toLowerCase().includes(lowercasedFilter) ||
            String(item.id).includes(lowercasedFilter)
        );
    }, [products, searchTerm]);

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredProducts.slice(start, start + itemsPerPage);
    }, [filteredProducts, currentPage, itemsPerPage]);

    const renderPagination = () => {
        let pages = [];
        const buttonClass = `px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 border dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600`;
        const activeButtonClass = `bg-primary text-white`;

        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`px-3 py-1 rounded-md ${currentPage === i ? activeButtonClass : buttonClass}`}
                >
                    {i}
                </button>
            );
        }
        return pages;
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                {/* Thanh tìm kiếm */}
                <div className="mb-6">
                     <div className="relative">
                        <input
                            type="text"
                            placeholder={t('dl.products.searchPlaceholder')}
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full bg-gray-50 border border-gray-200 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
                <h2 className="text-lg font-bold text-gray-800 mb-4 dark:text-white">{t('dl.products.listTitle')}</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">{t('dl.products.idHeader')}</th>
                                <th className="px-6 py-3">{t('dl.products.nameHeader')}</th>
                                <th className="px-6 py-3">{t('dl.products.statusHeader')}</th>
                                <th className="px-6 py-3">{t('dl.products.reasonHeader')}</th>
                                <th className="px-6 py-3">{t('dl.products.distributedDateHeader')}</th>
                                <th className="px-6 py-3">{t('dl.products.lastUpdateHeader')}</th>
                                <th className="px-6 py-3 text-center"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="8" className="text-center py-10 dark:text-gray-400">{t('general.loading')}</td></tr>
                            ) : paginatedProducts.length === 0 ? (
                                <tr><td colSpan="8" className="text-center py-10 dark:text-gray-400">{t('dl.products.notFound')}</td></tr>
                            ) : (
                                paginatedProducts.map(product => (
                                    <tr key={product.id1} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{product.id}</td>
                                        <td className="px-6 py-4 dark:text-gray-300">{product.name}</td>
                                        <td className="px-6 py-4"><StatusBadge status={product.status} /></td>
                                        <td className="px-6 py-4 text-xs dark:text-gray-400">{product.reason}</td>
                                        <td className="px-6 py-4 dark:text-gray-300">
                                            {product.distributionDate ? new Date(product.distributionDate).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US') : '-'}
                                        </td>
                                        <td className="px-6 py-4 dark:text-gray-300">
                                            {product.lastUpdateDate ? new Date(product.lastUpdateDate).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US') : '-'}
                                        </td>
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
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-between items-center mt-6">
                <p className="text-sm text-gray-500">
                    {t('general.showingResults', { 
                        start: paginatedProducts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0,
                        end: (currentPage - 1) * itemsPerPage + paginatedProducts.length,
                        total: paginatedProducts.length
                    })}
                </p>
                <div className="flex gap-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 rounded border bg-white disabled:opacity-50">{'<'}</button>
                    {renderPagination()}
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 rounded border bg-white disabled:opacity-50">{'>'}</button>
                </div>
            </div>
            </div>
        </div>
    );
};

export default ProductPage;