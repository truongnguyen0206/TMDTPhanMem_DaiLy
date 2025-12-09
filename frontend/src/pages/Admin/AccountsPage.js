import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useOutletContext, Link, useLocation } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { LuSearch, LuPencil, LuTrash2, LuPlus, LuPin, LuFilter, LuCheck } from 'react-icons/lu';

// --- Component RoleBadge (Style compact) ---
const RoleBadge = ({ roleName }) => {
    let colorClasses = 'bg-gray-100 text-gray-800';
    switch (roleName) {
        case 'Admin': colorClasses = 'bg-red-100 text-red-800'; break;
        case 'Nhà phân phối': colorClasses = 'bg-purple-100 text-purple-800'; break;
        case 'Đại lý': colorClasses = 'bg-blue-100 text-blue-800'; break;
        case 'Cộng tác viên': colorClasses = 'bg-yellow-100 text-yellow-800'; break;
        case 'Khách hàng': colorClasses = 'bg-green-100 text-green-800'; break;
        default: break;
    }
    return (
        <span className={`px-3 py-1 text-xs font-bold rounded-full ${colorClasses}`}>
            {roleName || 'Chưa xác định'}
        </span>
    );
};

// --- Component StatusBadge (Style compact) ---
const StatusBadge = ({ status }) => {
    let style = {};
    switch (status) {
        case 'Đang hoạt động': style = { text: 'Hoạt động', color: 'bg-green-100 text-green-800' }; break;
        case 'Đang chờ cấp tài khoản': style = { text: 'Chờ cấp', color: 'bg-yellow-100 text-yellow-800' }; break;
        case 'Ngừng hoạt động': style = { text: 'Đã khóa', color: 'bg-red-100 text-red-800' }; break;
        default: style = { text: status || 'Không rõ', color: 'bg-gray-100 text-gray-800' };
    }
    return (
        <span className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${style.color}`}>
            {style.text}
        </span>
    );
};

const AccountsPage = () => {
    const { setPageTitle } = useOutletContext();
    const location = useLocation();
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    
    // State cho Pin Dropdown
    const [pinnedStatus, setPinnedStatus] = useState('');
    const [isPinDropdownOpen, setIsPinDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Click outside to close dropdown
    useEffect(() => {
        if (location.state?.autoFilterStatus) {
            // Nếu có tín hiệu từ Dashboard gửi sang
            setPinnedStatus(location.state.autoFilterStatus);
            
            // (Tùy chọn) Xóa state sau khi dùng để nếu reload trang không bị kẹt
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    useEffect(() => {

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsPinDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        setPageTitle('Quản lý Tài khoản');
        const fetchAccounts = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await axiosClient.get('/users');
                setAccounts(response.data || []);
            } catch (err) {
                console.error("Lỗi tải danh sách:", err);
                setError('Không thể tải danh sách tài khoản.');
            } finally {
                setLoading(false);
            }
        };
        fetchAccounts();
    }, [setPageTitle]);

    // Xử lý xóa tài khoản
    const handleDeleteAccount = async (userId, username) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${username}" (ID: ${userId}) không?`)) {
            try {
                await axiosClient.delete(`/users/deleteUser/${userId}`);
                setAccounts(prev => prev.filter(acc => acc.user_id !== userId));
                alert(`Đã xóa thành công tài khoản "${username}".`);
            } catch (err) {
                alert('Xóa tài khoản thất bại.');
            }
        }
    };

    // 🆕 HÀM DUYỆT NHANH (QUICK APPROVE)
    const handleQuickApprove = async (userId, username) => {
        if (window.confirm(`Duyệt yêu cầu cấp tài khoản cho "${username}"?`)) {
            try {
                // Gọi API update trạng thái thành 'Đang hoạt động'
                await axiosClient.put(`/users/updateUser/${userId}`, { status: 'Đang hoạt động' });
                
                // Cập nhật UI ngay lập tức
                setAccounts(prev => prev.map(acc => 
                    acc.user_id === userId ? { ...acc, status: 'Đang hoạt động' } : acc
                ));
                
                // alert(`Đã duyệt tài khoản "${username}" thành công!`);
            } catch (err) {
                console.error("Lỗi khi duyệt:", err);
                alert('Duyệt thất bại. Vui lòng thử lại.');
            }
        }
    };

    const handleSearchChange = (e) => setSearchTerm(e.target.value);
    const handleRoleFilterChange = (e) => setRoleFilter(e.target.value);
    
    const handleSelectStatus = (status) => {
        setPinnedStatus(status === pinnedStatus ? '' : status);
        setIsPinDropdownOpen(false);
    };

    const filteredAccounts = useMemo(() => {
        return accounts.filter(account => {
            const matchesSearch = searchTerm === '' ||
                account.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                account.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                String(account.user_id).includes(searchTerm);
            const matchesRole = roleFilter === '' || String(account.role_id) === roleFilter;
            const matchesStatus = pinnedStatus === '' || account.status === pinnedStatus;
            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [accounts, searchTerm, roleFilter, pinnedStatus]);

    const itemsPerPage = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
    const paginatedAccounts = filteredAccounts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => { setCurrentPage(1); }, [searchTerm, roleFilter, pinnedStatus]);

    // Render Pagination
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
                    className={`px-3 py-1 rounded-md ${currentPage === i ? 'bg-blue-50 text-blue-600 border-blue-100 font-medium' : 'bg-white text-gray-700 hover:bg-gray-100 border'}`}
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
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            {/* HEADER & BỘ LỌC */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full sm:w-64 bg-gray-50 border border-gray-200 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary text-sm transition-all"
                        />
                        <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>

                    <div className="relative">
                        <select
                            value={roleFilter}
                            onChange={handleRoleFilterChange}
                            className="bg-gray-50 border border-gray-200 rounded-lg py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-primary text-sm cursor-pointer appearance-none"
                        >
                            <option value="">Tất cả vai trò</option>
                            <option value="1">Admin</option>
                            <option value="2">Nhà phân phối</option>
                            <option value="3">Đại lý</option>
                            <option value="4">Cộng tác viên</option>
                            <option value="5">Khách hàng</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <LuFilter className="text-gray-400" size={14}/>
                        </div>
                    </div>

                    {/* NÚT GHIM DROPDOWN */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsPinDropdownOpen(!isPinDropdownOpen)}
                            className={`
                                flex items-center justify-center w-9 h-9 rounded-lg border transition-all duration-200
                                ${pinnedStatus 
                                    ? 'bg-blue-50 border-blue-300 text-blue-600 shadow-sm' 
                                    : 'bg-white border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50'}
                            `}
                            title="Lọc theo trạng thái"
                        >
                            <LuPin size={16} className={pinnedStatus ? "fill-current rotate-45" : ""} />
                        </button>

                        {isPinDropdownOpen && (
                            <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                                <div className="py-1">
                                    <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 bg-gray-50">
                                        Lọc theo trạng thái
                                    </div>
                                    <button onClick={() => handleSelectStatus('')} className={`w-full text-left px-4 py-2 text-sm flex justify-between hover:bg-gray-50 ${pinnedStatus === '' ? 'text-blue-600 bg-blue-50 font-medium' : 'text-gray-700'}`}><span>Tất cả</span>{pinnedStatus === '' && <LuCheck size={16} />}</button>
                                    <button onClick={() => handleSelectStatus('Đang hoạt động')} className={`w-full text-left px-4 py-2 text-sm flex justify-between hover:bg-gray-50 ${pinnedStatus === 'Đang hoạt động' ? 'text-green-600 bg-green-50 font-medium' : 'text-gray-700'}`}><span>Đang hoạt động</span>{pinnedStatus === 'Đang hoạt động' && <LuCheck size={16} />}</button>
                                    <button onClick={() => handleSelectStatus('Đang chờ cấp tài khoản')} className={`w-full text-left px-4 py-2 text-sm flex justify-between hover:bg-gray-50 ${pinnedStatus === 'Đang chờ cấp tài khoản' ? 'text-yellow-600 bg-yellow-50 font-medium' : 'text-gray-700'}`}><span>Đang chờ cấp</span>{pinnedStatus === 'Đang chờ cấp tài khoản' && <LuCheck size={16} />}</button>
                                    <button onClick={() => handleSelectStatus('Ngừng hoạt động')} className={`w-full text-left px-4 py-2 text-sm flex justify-between hover:bg-gray-50 ${pinnedStatus === 'Ngừng hoạt động' ? 'text-red-600 bg-red-50 font-medium' : 'text-gray-700'}`}><span>Ngừng hoạt động</span>{pinnedStatus === 'Ngừng hoạt động' && <LuCheck size={16} />}</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <Link to="/admin/accounts/new" className="flex items-center gap-2 bg-primary text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm whitespace-nowrap">
                    <LuPlus size={18} /> Thêm tài khoản
                </Link>
            </div>

            {error && <p className="text-red-600 text-center mb-4 text-sm">{error}</p>}

            {/* BẢNG DỮ LIỆU */}
            <div className="overflow-x-auto border border-gray-100 rounded-lg">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-3 font-semibold">ID</th>
                            <th className="px-6 py-3 font-semibold">Tên tài khoản</th>
                            <th className="px-6 py-3 font-semibold">Email</th>
                            <th className="px-6 py-3 font-semibold">SĐT</th>
                            <th className="px-6 py-3 font-semibold">Vai trò</th>
                            <th className="px-6 py-3 font-semibold">Trạng thái</th>
                            <th className="px-6 py-3 font-semibold">Ngày tạo</th>
                            <th className="px-6 py-3 font-semibold text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="8" className="text-center py-10 text-gray-400">Đang tải dữ liệu...</td></tr>
                        ) : paginatedAccounts.length === 0 ? (
                            <tr><td colSpan="8" className="text-center py-10 text-gray-400">Không tìm thấy tài khoản nào.</td></tr>
                        ) : (
                            paginatedAccounts.map((account) => (
                                <tr key={account.user_id} className="bg-white hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-3 font-medium text-gray-900">{account.user_id}</td>
                                    <td className="px-6 py-3 font-medium text-gray-800">{account.username}</td>
                                    <td className="px-6 py-3 text-gray-500">{account.email}</td>
                                    <td className="px-6 py-3 text-gray-500">{account.phone || '-'}</td>
                                    <td className="px-6 py-3"><RoleBadge roleName={account.role_name} /></td>
                                    <td className="px-6 py-3"><StatusBadge status={account.status} /></td>
                                    <td className="px-6 py-3 text-gray-500">
                                        {account.created_at ? new Date(account.created_at).toLocaleDateString('vi-VN') : '-'}
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            
                                            {/* ✅ NÚT DUYỆT NHANH (Chỉ hiện khi trạng thái là 'Đang chờ cấp tài khoản') */}
                                            {account.status === 'Đang chờ cấp tài khoản' && (
                                                <button
                                                    onClick={() => handleQuickApprove(account.user_id, account.username)}
                                                    className="p-1.5 text-white bg-green-500 hover:bg-green-600 rounded-md shadow-sm transition-all"
                                                    title="Duyệt tài khoản (Kích hoạt ngay)"
                                                >
                                                    <LuCheck size={16} />
                                                </button>
                                            )}

                                            <Link
                                                to={`/admin/accounts/edit/${account.user_id}`}
                                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title="Sửa thông tin"
                                            >
                                                <LuPencil size={18} />
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteAccount(account.user_id, account.username)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                title="Xóa tài khoản"
                                            >
                                                <LuTrash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* FOOTER: PHÂN TRANG */}
            {!loading && filteredAccounts.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                        Hiển thị <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredAccounts.length)}</span> đến <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredAccounts.length)}</span> trong tổng số <span className="font-medium">{filteredAccounts.length}</span> tài khoản
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