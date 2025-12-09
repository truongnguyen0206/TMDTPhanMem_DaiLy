import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { LuSearch } from 'react-icons/lu';

// Dữ liệu mẫu
const mockProducts = [
    { id: 1, source: 'Nguồn A', name: 'Sản phẩm 1', status: 'active', quantity: 1500, price: 1000 },
    { id: 2, source: 'Nguồn B', name: 'Sản phẩm 2', status: 'active', quantity: 1500, price: 1000 },
    { id: 3, source: 'Nguồn A', name: 'Sản phẩm 3', status: 'active', quantity: 1500, price: 1000 },
    { id: 4, source: 'Nguồn C', name: 'Sản phẩm 4', status: 'active', quantity: 1500, price: 1000 },
    { id: 5, source: 'Nguồn A', name: 'Sản phẩm 5', status: 'inactive', quantity: 0, price: 1000 },
    { id: 6, source: 'Nguồn B', name: 'Sản phẩm 6', status: 'active', quantity: 1500, price: 1000 },
    { id: 7, source: 'Nguồn C', name: 'Sản phẩm 7', status: 'inactive', quantity: 0, price: 1000 },
];

// Component cho các thẻ thống kê nhỏ
const StatCard = ({ title, value }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
);

// Component cho trạng thái sản phẩm
const StatusBadge = ({ status }) => {
    const statusStyles = {
        active: { text: 'Xây dựng', color: 'bg-green-100 text-green-800' },
        inactive: { text: 'Không khả dụng', color: 'bg-red-100 text-red-800' },
    };
    const style = statusStyles[status] || {};
    return <span className={`px-3 py-1 text-xs font-bold rounded-full ${style.color}`}>{style.text}</span>;
};


const ProductPage = () => {
    const { setPageTitle } = useOutletContext();
    const [products, setProducts] = useState(mockProducts);
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 10;

    useEffect(() => {
        setPageTitle('Danh mục sản phẩm');
    }, [setPageTitle]);

    const renderPagination = () => {
        let pages = [];
        for(let i = 1; i <= 3; i++) {
             pages.push(<button key={i} onClick={() => setCurrentPage(i)} className={`px-3 py-1 rounded-md ${currentPage === i ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border'}`}>{i}</button>);
        }
        pages.push(<span key="dots" className="px-3 py-1">...</span>);
        pages.push(<button key={10} onClick={() => setCurrentPage(10)} className={`px-3 py-1 rounded-md ${currentPage === 10 ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border'}`}>{10}</button>);
        return pages;
    };

    return (
        <div className="space-y-6">
            {/* Thẻ thống kê */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <StatCard title="Tổng sản phẩm" value="15" />
                 <StatCard title="Khả dụng" value="8" />
            </div>

            {/* Bảng sản phẩm */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">ID</th>
                                <th className="px-6 py-3">Source</th>
                                <th className="px-6 py-3">Tên sản phẩm</th>
                                <th className="px-6 py-3">Trạng thái</th>
                                <th className="px-6 py-3">Lượt tải</th>
                                <th className="px-6 py-3">Giá</th>
                                <th className="px-6 py-3 text-center">Tác vụ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{product.id}</td>
                                    <td className="px-6 py-4">{product.source}</td>
                                    <td className="px-6 py-4">{product.name}</td>
                                    <td className="px-6 py-4"><StatusBadge status={product.status} /></td>
                                    <td className="px-6 py-4">{product.quantity.toLocaleString('vi-VN')}</td>
                                    <td className="px-6 py-4">{product.price.toLocaleString('vi-VN')}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-3 rounded-md">Tạo mã giới thiệu</button>
                                            <button className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold py-1 px-3 rounded-md">Xem chi tiết</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                 {/* Phân trang */}
                <div className="flex justify-between items-center mt-6">
                    <p className="text-sm text-gray-500">Showing 1 to 7 of 15 results</p>
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