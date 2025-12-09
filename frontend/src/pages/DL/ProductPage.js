import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { LuPencil, LuSearch } from 'react-icons/lu';

// Dữ liệu mẫu được cập nhật để khớp với thiết kế mới
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

// Component cho trạng thái sản phẩm
const StatusBadge = ({ status }) => {
    const statusStyles = {
        active: { text: 'Đang hoạt động', color: 'bg-green-100 text-green-800' },
        inactive: { text: 'Ngừng hoạt động', color: 'bg-red-100 text-red-800' },
    };
    const style = statusStyles[status] || {};
    return <span className={`px-3 py-1 text-xs font-bold rounded-full ${style.color}`}>{style.text}</span>;
};

const ProductPage = () => {
    const { setPageTitle } = useOutletContext();
    const [products] = useState(mockProducts);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const totalPages = 10; // Giả sử

    useEffect(() => {
        setPageTitle('Sản phẩm');
    }, [setPageTitle]);

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

    const renderPagination = () => {
        let pages = [];
        for (let i = 1; i <= 4; i++) {
            pages.push(<button key={i} onClick={() => setCurrentPage(i)} className={`px-3 py-1 rounded-md ${currentPage === i ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border'}`}>{i}</button>);
        }
        pages.push(<span key="dots" className="px-3 py-1">...</span>);
        pages.push(<button key={10} onClick={() => setCurrentPage(10)} className={`px-3 py-1 rounded-md ${currentPage === 10 ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border'}`}>{10}</button>);
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
                            placeholder="Search by mã sản phẩm hoặc tên sản phẩm"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full bg-gray-50 border border-gray-200 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>

                <h2 className="text-lg font-bold text-gray-800 mb-4">Danh sách sản phẩm được phân phối</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">ID SẢN PHẨM</th>
                                <th className="px-6 py-3">TÊN SẢN PHẨM</th>
                                <th className="px-6 py-3">HOA HỒNG</th>
                                <th className="px-6 py-3">TÌNH TRẠNG</th>
                                <th className="px-6 py-3">LÝ DO</th>
                                <th className="px-6 py-3">NGÀY ĐƯỢC PHÂN PHỐI</th>
                                <th className="px-6 py-3">NGÀY CẬP NHẬT GẦN NHẤT</th>
                                <th className="px-6 py-3 text-center"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(product => (
                                <tr key={product.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{product.id}</td>
                                    <td className="px-6 py-4">{product.name}</td>
                                    <td className="px-6 py-4">{product.commission}</td>
                                    <td className="px-6 py-4"><StatusBadge status={product.status} /></td>
                                    <td className="px-6 py-4 text-xs">{product.reason}</td>
                                    <td className="px-6 py-4">{product.distributionDate} <span className="text-gray-400">2:53PM</span></td>
                                    <td className="px-6 py-4">{product.lastUpdateDate} <span className="text-gray-400">2:53PM</span></td>
                                    <td className="px-6 py-4 text-center">
                                        <Link
                                            to={`/dl/products/commission/edit/${product.id}`}
                                            state={{ productData: product }}
                                            className="text-gray-400 hover:text-blue-600"
                                        >
                                            <LuPencil size={18} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                 {/* Phân trang */}
                <div className="flex justify-between items-center mt-6">
                    <p className="text-sm text-gray-500">Showing 1 to 10 of 97 results</p>
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 border">{'<'}</button>
                        {renderPagination()}
                        <button className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 border">{'>'}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductPage;