import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { LuSearch, LuPencil, LuTrash2, LuPlus } from 'react-icons/lu'; // Bỏ LuCalendarDays nếu không dùng
import { useOutletContext } from 'react-router-dom';

// --- BẮT ĐẦU THAY ĐỔI ---

// 1. Định nghĩa số lượng mục mỗi trang
const ITEMS_PER_PAGE = 10;

// ... (component StatusBadge giữ nguyên) ...
const StatusBadge = ({ status }) => {
    let style = {};
    switch (status?.toLowerCase()) { // Thêm optional chaining phòng trường hợp status null/undefined
        case 'đang hoạt động':
            style = { text: 'Đang hoạt động', color: 'bg-green-100 text-green-800' };
            break;
        case 'cần hoàn đồng': // Giữ lại status này nếu có thể áp dụng cho CTV
            style = { text: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800' };
            break;
        case 'ngừng hoạt động':
            style = { text: 'Ngừng hoạt động', color: 'bg-red-100 text-red-800' };
            break;
        default:
            style = { text: status || 'Không rõ', color: 'bg-gray-100 text-gray-800' }; // Hiển thị 'Không rõ' nếu status null/undefined
    }

    return (
        <span className={`px-3 py-1 text-xs font-bold rounded-full ${style.color}`}>
            {style.text}
        </span>
    );
};

const CTVPage = () => {
    // Đổi tên state từ agents thành ctvs
    const [ctvs, setCtvs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const { setPageTitle } = useOutletContext();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setPageTitle('Cộng tác viên'); // Đổi tiêu đề
        const fetchCtvs = async () => { // Đổi tên hàm
            setLoading(true);
            try {
                // 2. Gọi API lấy danh sách CTV
                // Dựa trên backend, endpoint có thể là '/CTV/getAllCTV'
                const response = await axiosClient.get('/CTV/getAllCTV');
                const ctvData = response.data.data; // API trả về trong { data: [...] }

                // Thêm trạng thái giả lập (điều chỉnh nếu cần)
                const ctvsWithStatus = ctvData.map((ctv, index) => {
                    const statuses = ['Đang hoạt động', 'Chờ duyệt', 'Ngừng hoạt động'];
                     // API trả về user_id, ctv_id, ctv_code, ctv_name,...
                     // Sử dụng ctv_id hoặc user_id để tạo status giả
                    const idForStatus = ctv.ctv_id || ctv.user_id || index;
                    return {
                        ...ctv,
                         // Gán status giả lập
                        status: statuses[idForStatus % statuses.length],
                         // Gán created_at giả lập nếu API không có (lấy ngaythamgia)
                        created_at: ctv.created_at || ctv.ngaythamgia || new Date().toISOString()
                    };
                });

                setCtvs(ctvsWithStatus); // Cập nhật state ctvs
            } catch (error) {
                console.error("Lỗi khi tải danh sách Cộng tác viên:", error);
                 if (error.response && error.response.status === 404) {
                    alert("Lỗi: Không tìm thấy API endpoint '/CTV/getAllCTV'. Vui lòng kiểm tra lại Backend.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCtvs(); // Gọi hàm fetchCtvs
    }, [setPageTitle]);

    // Hàm xử lý xóa CTV
    const handleDeleteCtv = async (ctvIdToDelete) => { // Đổi tên hàm và tham số
        const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa cộng tác viên này không?');

        if (confirmDelete) {
            try {
                 // 3. Gọi API xóa CTV
                 // Dựa trên backend, endpoint là '/CTV/removeCTV/:id' và :id là ctv_id
                await axiosClient.delete(`/CTV/removeCTV/${ctvIdToDelete}`);

                // Cập nhật state sau khi xóa thành công
                setCtvs(prevCtvs => prevCtvs.filter(ctv => ctv.ctv_id !== ctvIdToDelete));
                alert('Cộng tác viên đã được xóa thành công.');
            } catch (error) {
                console.error("Lỗi khi xóa cộng tác viên:", error);
                const errorMessage = error.response?.data?.message || 'Xóa cộng tác viên thất bại.';
                alert(errorMessage);
            }
        }
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
    };

    // 4. Lọc danh sách CTV theo từ khóa tìm kiếm
    const filteredCtvs = useMemo(() => { // Đổi tên biến
        if (!searchTerm) {
            return ctvs;
        }
        const searchLower = searchTerm.toLowerCase();
        return ctvs.filter(ctv => {
            // Tìm kiếm bằng ctv_code hoặc ctv_name
            const ctvCode = ctv.ctv_code ? ctv.ctv_code.toLowerCase() : '';
            const ctvName = ctv.ctv_name ? ctv.ctv_name.toLowerCase() : ''; // API trả về ctv_name

            return ctvCode.includes(searchLower) || ctvName.includes(searchLower);
        });
    }, [ctvs, searchTerm]); // Phụ thuộc vào ctvs

    // 5. Tính toán tổng số trang
    const totalPages = Math.ceil(filteredCtvs.length / ITEMS_PER_PAGE);

    // 6. "Cắt" mảng dữ liệu đã lọc cho trang hiện tại
    const paginatedCtvs = useMemo(() => { // Đổi tên biến
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredCtvs.slice(startIndex, endIndex);
    }, [filteredCtvs, currentPage]); // Phụ thuộc vào filteredCtvs

    // 7. Hàm render các nút phân trang (giữ nguyên logic)
    const renderPagination = () => {
        if (totalPages <= 1) return null;
        const pages = [];
        const maxPagesToShow = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }
        if (startPage > 1) {
            pages.push(<button key={1} onClick={() => setCurrentPage(1)} className={`px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 border`}>1</button>);
            if (startPage > 2) {
                pages.push(<span key="dots-start" className="px-3 py-1">...</span>);
            }
        }
        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`px-3 py-1 rounded-md ${currentPage === i ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border'}`}
                >
                    {i}
                </button>
            );
        }
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pages.push(<span key="dots-end" className="px-3 py-1">...</span>);
            }
            pages.push(<button key={totalPages} onClick={() => setCurrentPage(totalPages)} className={`px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 border`}>{totalPages}</button>);
        }
        return pages;
    };

    // 8. Hàm xử lý chuyển trang (giữ nguyên logic)
    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };


    return (
        <div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tìm theo mã hoặc tên CTV" // Đổi placeholder
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-80 bg-light-gray border border-border-color rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                    <Link
                        to="/dl/ctv/new" // Link đến trang thêm CTV
                        className="flex items-center gap-2 bg-green-500 text-white font-bold px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                    >
                       <LuPlus size={20} />
                       Thêm cộng tác viên
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                         <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Mã CTV</th>
                                <th scope="col" className="px-6 py-3">Tên CTV</th>
                                <th scope="col" className="px-6 py-3">Trạng Thái</th>
                                <th scope="col" className="px-6 py-3">Ngày Tạo</th>
                                <th scope="col" className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-4">Đang tải dữ liệu...</td></tr>
                            // 9. Sử dụng paginatedCtvs để render và kiểm tra length
                            ) : paginatedCtvs.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-4">Không tìm thấy cộng tác viên nào.</td></tr>
                            ) : (
                                paginatedCtvs.map((ctv) => (
                                    <tr key={ctv.ctv_id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {/* Hiển thị ctv_code */}
                                            {ctv.ctv_code || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {/* Hiển thị ctv_name */}
                                            {ctv.ctv_name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4"><StatusBadge status={ctv.status} /></td>
                                        <td className="px-6 py-4">
                                             {/* Hiển thị ngày tạo (created_at hoặc ngaythamgia) */}
                                            {new Date(ctv.created_at || ctv.ngaythamgia).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-4">
                                                 {/* Link sửa dùng user_id (nếu trang edit cần user_id) hoặc ctv_id */}
                                                <Link to={`/dl/ctv/edit/${ctv.user_id}`} className="text-gray-400 hover:text-green-600">
                                                    <LuPencil size={18} />
                                                </Link>
                                                {/* Nút xóa dùng ctv_id */}
                                                <button
                                                onClick={() => handleDeleteCtv(ctv.ctv_id)}
                                                className="text-gray-400 hover:text-red-600"><LuTrash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 10. Cập nhật hiển thị phân trang */}
                <div className="flex justify-between items-center mt-6">
                    <p className="text-sm text-gray-500">
                        Hiển thị {paginatedCtvs.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}
                        đến {(currentPage - 1) * ITEMS_PER_PAGE + paginatedCtvs.length}
                        trong tổng số {filteredCtvs.length} kết quả
                    </p>
                    {totalPages > 1 && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                                className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 border disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {'<'}
                            </button>
                            {renderPagination()}
                            <button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 border disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {'>'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CTVPage;
