import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient'; // Import axiosClient
// Sửa lại import icons
import { LuSearch, LuPencil, LuTrash2, LuPlus } from 'react-icons/lu';

// --- Component RoleBadge (Giữ nguyên hoặc tùy chỉnh) ---
const RoleBadge = ({ roleName }) => {
    let colorClasses = 'bg-gray-100 text-gray-800'; // Mặc định
    switch (roleName) {
        case 'Admin':
            colorClasses = 'bg-red-100 text-red-800';
            break;
        case 'Nhà phân phối':
            colorClasses = 'bg-purple-100 text-purple-800';
            break;
        case 'Đại lý':
            colorClasses = 'bg-blue-100 text-blue-800';
            break;
        case 'Cộng tác viên':
            colorClasses = 'bg-yellow-100 text-yellow-800';
            break;
        case 'Khách hàng':
            colorClasses = 'bg-green-100 text-green-800';
            break;
        default:
            break;
    }
    return (
        <span className={`px-3 py-1 text-xs font-bold rounded-full ${colorClasses}`}>
            {roleName || 'Chưa xác định'}
        </span>
    );
};

// --- Component StatusBadge (Mới hoặc Tái sử dụng) ---
const StatusBadge = ({ status }) => {
    let style = {};
    // Dùng switch case để dễ mở rộng
    switch (status) {
        case 'Đang hoạt động':
            style = { text: 'Hoạt động', color: 'bg-green-100 text-green-800' };
            break;
        case 'Đang chờ cấp tài khoản':
            style = { text: 'Chờ cấp', color: 'bg-yellow-100 text-yellow-800' };
            break;
        case 'Ngừng hoạt động':
            style = { text: 'Đã khóa', color: 'bg-red-100 text-red-800' };
            break;
        default:
            style = { text: status || 'Không rõ', color: 'bg-gray-100 text-gray-800' };
    }
    return (
        <span className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${style.color}`}>
            {style.text}
        </span>
    );
};

const AccountsPage = () => {
    const { setPageTitle } = useOutletContext();
    // --- THAY ĐỔI: State cho dữ liệu, loading, lỗi, tìm kiếm ---
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState(''); // Thêm bộ lọc vai trò

    useEffect(() => {
        setPageTitle('Quản lý Tài khoản');
        // --- THAY ĐỔI: Fetch dữ liệu từ API ---
        const fetchAccounts = async () => {
            setLoading(true);
            setError('');
            try {
                // Gọi API GET /users
                const response = await axiosClient.get('/users'); //
                setAccounts(response.data || []); // Cập nhật state với dữ liệu nhận được
            } catch (err) {
                console.error("Lỗi khi tải danh sách tài khoản:", err);
                setError('Không thể tải danh sách tài khoản. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };

        fetchAccounts();
    }, [setPageTitle]);

    // --- THAY ĐỔI: Hàm xử lý xóa tài khoản ---
    const handleDeleteAccount = async (userId, username) => {
        // Hỏi xác nhận
        if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${username}" (ID: ${userId}) không? Hành động này không thể hoàn tác.`)) {
            try {
                setError('');
                // Gọi API DELETE /users/deleteUser/:id
                await axiosClient.delete(`/users/deleteUser/${userId}`); //
                // Cập nhật lại danh sách trên UI
                setAccounts(prevAccounts => prevAccounts.filter(acc => acc.user_id !== userId));
                alert(`Đã xóa thành công tài khoản "${username}".`);
            } catch (err) {
                console.error("Lỗi khi xóa tài khoản:", err);
                const apiError = err.response?.data?.message || err.message || 'Xóa tài khoản thất bại.';
                setError(`Lỗi: ${apiError}`);
                alert(`Lỗi khi xóa tài khoản: ${apiError}`);
            }
        }
    };

    // --- THÊM: Xử lý thay đổi ô tìm kiếm và bộ lọc ---
    const handleSearchChange = (e) => setSearchTerm(e.target.value);
    const handleRoleFilterChange = (e) => setRoleFilter(e.target.value);

    // --- THÊM: Lọc danh sách tài khoản bằng useMemo ---
    const filteredAccounts = useMemo(() => {
        return accounts.filter(account => {
            const matchesSearch = searchTerm === '' ||
                account.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                account.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                String(account.user_id).includes(searchTerm);

            const matchesRole = roleFilter === '' || String(account.role_id) === roleFilter;

            return matchesSearch && matchesRole;
        });
    }, [accounts, searchTerm, roleFilter]);

    // --- THÊM: Render phân trang (tạm thời đơn giản) ---
    const itemsPerPage = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
    const paginatedAccounts = filteredAccounts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
            pages.push(<button key="first" onClick={() => setCurrentPage(1)} className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 border">1</button>);
            if (startPage > 2) pages.push(<span key="start-ellipsis" className="px-3 py-1">...</span>);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`px-3 py-1 rounded-md ${currentPage === i ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 hover:bg-gray-100 border'}`}
                >
                    {i}
                </button>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) pages.push(<span key="end-ellipsis" className="px-3 py-1">...</span>);
            pages.push(<button key="last" onClick={() => setCurrentPage(totalPages)} className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 border">{totalPages}</button>);
        }

        return pages;
    };


    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200">
            {/* Thanh tìm kiếm và bộ lọc */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    {/* Ô tìm kiếm */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tìm theo tên, email, ID..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full sm:w-80 bg-gray-50 border border-gray-200 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                    {/* Bộ lọc vai trò */}
                    <select
                        value={roleFilter}
                        onChange={handleRoleFilterChange}
                        className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-auto"
                    >
                        <option value="">Tất cả vai trò</option>
                        {/* Nên fetch danh sách roles từ API /roles thay vì hardcode */}
                        <option value="1">Admin</option>
                        <option value="2">Nhà phân phối</option>
                        <option value="3">Đại lý</option>
                        <option value="4">Cộng tác viên</option>
                        <option value="5">Khách hàng</option>
                    </select>
                </div>

                {/* Nút Thêm tài khoản */}
                <Link
                    to="/admin/accounts/new" //
                    className="flex items-center gap-2 bg-primary text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full justify-center md:w-auto"
                >
                    <LuPlus size={20} />
                    Thêm tài khoản
                </Link>
            </div>

            {/* Hiển thị lỗi nếu có */}
            {error && <p className="text-red-600 text-center mb-4">{error}</p>}

            {/* Bảng dữ liệu */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">ID</th>
                            <th scope="col" className="px-6 py-3">Tên tài khoản</th>
                            <th scope="col" className="px-6 py-3">Email</th>
                            <th scope="col" className="px-6 py-3">SĐT</th>
                            <th scope="col" className="px-6 py-3">Vai trò</th>
                            <th scope="col" className="px-6 py-3">Trạng thái</th>
                            <th scope="col" className="px-6 py-3">Ngày tạo</th>
                            <th scope="col" className="px-6 py-3 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="8" className="text-center py-10 text-gray-500">Đang tải dữ liệu...</td></tr>
                        ) : paginatedAccounts.length === 0 ? (
                            <tr><td colSpan="8" className="text-center py-10 text-gray-500">Không tìm thấy tài khoản nào.</td></tr>
                        ) : (
                            paginatedAccounts.map((account) => (
                                <tr key={account.user_id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{account.user_id}</td>
                                    <td className="px-6 py-4">{account.username}</td>
                                    <td className="px-6 py-4">{account.email}</td>
                                    <td className="px-6 py-4">{account.phone || '-'}</td>
                                    <td className="px-6 py-4"><RoleBadge roleName={account.role_name} /></td>
                                    <td className="px-6 py-4"><StatusBadge status={account.status} /></td>
                                    <td className="px-6 py-4">
                                        {account.created_at ? new Date(account.created_at).toLocaleDateString('vi-VN') : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            {/* --- THÊM Nút Sửa --- */}
                                            <Link
                                                to={`/admin/accounts/edit/${account.user_id}`} // Sẽ cần sửa route này
                                                className="text-gray-400 hover:text-blue-600"
                                                title="Sửa tài khoản"
                                            >
                                                <LuPencil size={18} />
                                            </Link>
                                            {/* --- THÊM Nút Xóa --- */}
                                            <button
                                                onClick={() => handleDeleteAccount(account.user_id, account.username)}
                                                className="text-gray-400 hover:text-red-600"
                                                title="Xóa tài khoản"
                                                // Không cho xóa chính mình nếu là Admin
                                                // disabled={user?.id === account.user_id && user?.role === 'Admin'} // Cần lấy user từ useAuth
                                            >
                                                <LuTrash2 size={18} />
                                            </button>
                                            {/* Có thể thêm nút Khóa/Mở, Reset MK ở đây */}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Phân trang */}
            {!loading && filteredAccounts.length > itemsPerPage && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                    <p className="text-sm text-gray-500">
                        Hiển thị {(currentPage - 1) * itemsPerPage + 1} đến {Math.min(currentPage * itemsPerPage, filteredAccounts.length)} của {filteredAccounts.length} kết quả
                    </p>
                    <div className="flex items-center gap-2 flex-wrap justify-center">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 border disabled:opacity-50"
                        >
                            {'<'}
                        </button>
                        {renderPagination()}
                        <button
                             onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                             disabled={currentPage === totalPages}
                            className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 border disabled:opacity-50"
                        >
                            {'>'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountsPage;