import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { LuSearch, LuLink, LuLoader, LuCheck } from 'react-icons/lu';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext'; 

// Hàm format tiền tệ
const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
};

const ProductPage = () => {
    const { setPageTitle } = useOutletContext();
    const { user } = useAuth(); // Lấy thông tin CTV đang đăng nhập

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // State quản lý trạng thái của từng nút bấm
    const [processingId, setProcessingId] = useState(null); 
    const [copiedId, setCopiedId] = useState(null); 

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        setPageTitle('Danh sách sản phẩm có thể bán'); 
        fetchProducts();
    }, [setPageTitle]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.get('/product/getallproducts');
            setProducts(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Lỗi tải sản phẩm:", error);
        } finally {
            setLoading(false);
        }
    };

    // 🟢 XỬ LÝ TẠO LINK & COPY (Logic cũ, Giao diện mới)
    const handleCreateAndCopyLink = async (product) => {
        if (!user) return alert("Vui lòng đăng nhập lại!");
        
        try {
            setProcessingId(product.product_id || product.id); 

            const payload = {
                owner_id: user.id || user.user_id,
                owner_role_id: user.role_id || 4,
                product_id: product.product_id || product.id
            };

            const res = await axiosClient.post('/product/create-link-product', payload);
            
            if (res.data.success) {
                const link = res.data.data.link || res.data.data.referral_url;
                await navigator.clipboard.writeText(link);
                
                // Hiệu ứng "Đã Copy"
                setCopiedId(product.product_id || product.id);
                setTimeout(() => {
                    setCopiedId(null);
                }, 3000);
            }
        } catch (error) {
            console.error("Lỗi tạo link:", error);
            alert("Không thể tạo link lúc này.");
        } finally {
            setProcessingId(null);
        }
    };

    // --- Logic Lọc & Phân trang ---
    const filteredProducts = useMemo(() => {
        if (!searchTerm) return products;
        const lower = searchTerm.toLowerCase();
        return products.filter(p => 
            (p.product_name || '').toLowerCase().includes(lower) ||
            String(p.product_id || p.id).includes(lower)
        );
    }, [products, searchTerm]);

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const currentItems = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const renderPagination = () => {
        if (totalPages <= 1) return null;
        let pages = [];
        for(let i = 1; i <= Math.min(totalPages, 5); i++) {
             pages.push(
                <button 
                    key={i} 
                    onClick={() => setCurrentPage(i)} 
                    className={`w-8 h-8 flex items-center justify-center rounded border text-sm font-medium transition-colors ${currentPage === i ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-300'}`}
                >
                    {i}
                </button>
            );
        }
        return pages;
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            {/* Header: Title & Search */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-lg font-bold text-gray-800">Danh sách sản phẩm có thể bán</h2>
                
                <div className="relative w-full md:w-72">
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
            </div>

            {/* Table - Layout giống hệt ảnh bạn gửi */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-500 uppercase bg-white border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 font-semibold">MÃ SP</th>
                            <th className="px-6 py-4 font-semibold">TÊN SẢN PHẨM</th>
                            <th className="px-6 py-4 font-semibold">MÔ TẢ</th>
                            <th className="px-6 py-4 font-semibold">SỐ LƯỢNG</th>
                            <th className="px-6 py-4 font-semibold">ĐƠN GIÁ</th>
                            <th className="px-6 py-4 font-semibold text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan="6" className="text-center py-10 text-gray-400">Đang tải dữ liệu...</td></tr>
                        ) : currentItems.length === 0 ? (
                            <tr><td colSpan="6" className="text-center py-10 text-gray-400">Không tìm thấy sản phẩm.</td></tr>
                        ) : (
                            currentItems.map((product) => {
                                const pId = product.product_id || product.id;
                                const isProcessing = processingId === pId;
                                const isCopied = copiedId === pId;
                                const isOutOfStock = (product.quantity || 0) <= 0;

                                return (
                                    <tr key={pId} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-gray-900 font-medium">
                                            {pId}
                                        </td>
                                        
                                        <td className="px-6 py-4">
                                            <span className="text-blue-600 font-medium hover:underline cursor-pointer">
                                                {product.product_name}
                                            </span>
                                        </td>
                                        
                                        <td className="px-6 py-4 text-gray-500 max-w-[250px] truncate" title={product.description}>
                                            {product.description || '-'}
                                        </td>
                                        
                                        <td className="px-6 py-4 font-bold text-green-600">
                                            {isOutOfStock ? <span className="text-red-500">0</span> : product.quantity}
                                        </td>
                                        
                                        <td className="px-6 py-4 font-bold text-gray-900">
                                            {formatCurrency(product.unit_price)}
                                        </td>
                                        
                                        <td className="px-6 py-4 text-right">
                                            {/* Nút bấm style giống ảnh: Xanh lá nhạt */}
                                            <button 
                                                onClick={() => handleCreateAndCopyLink(product)}
                                                disabled={isProcessing || isOutOfStock}
                                                className={`
                                                    inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all
                                                    ${isCopied 
                                                        ? 'bg-green-600 text-white'  // Trạng thái đã copy
                                                        : isOutOfStock 
                                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                            : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200' // Style mặc định giống ảnh
                                                    }
                                                `}
                                            >
                                                {isProcessing ? (
                                                    <><LuLoader className="animate-spin" /> Đang tạo...</>
                                                ) : isCopied ? (
                                                    <><LuCheck size={14} /> Đã Copy</>
                                                ) : (
                                                    <><LuLink size={14} /> Tạo Link Bán</>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer Pagination */}
            {!loading && products.length > 0 && (
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                        Hiển thị {currentItems.length} trên tổng {filteredProducts.length} sản phẩm
                    </p>
                    <div className="flex gap-1">
                        {renderPagination()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductPage;