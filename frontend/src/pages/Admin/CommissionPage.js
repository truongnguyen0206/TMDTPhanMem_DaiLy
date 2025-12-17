import { useState, useEffect, useMemo } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { LuPlus, LuPencil, LuTrash2, LuFilter } from 'react-icons/lu';

// 1. Cấu hình số lượng hiển thị mỗi trang
const ITEMS_PER_PAGE = 10;

// Danh sách Role cố định (Khớp với Form để lọc chuẩn)
const STATIC_ROLES = [
    { role_id: 2, role_name: 'Nhà phân phối' },
    { role_id: 3, role_name: 'Đại lý' },
    { role_id: 4, role_name: 'Cộng tác viên' }
];

// --- HELPER FUNCTIONS ---
const formatCurrency = (value) => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

// Hàm format ngày tháng (đã bỏ comment để hoạt động)
const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
        return new Date(dateString).toLocaleDateString('vi-VN');
    } catch (e) {
        return '-';
    }
};

// --- COMPONENTS CON ---
const RoleBadge = ({ roleId }) => {
    const role = STATIC_ROLES.find(r => r.role_id === roleId);
    const roleName = role ? role.role_name : `ID: ${roleId}`;
    let colorClasses = 'bg-gray-100 text-gray-800';

    if (roleId === 2) colorClasses = 'bg-purple-100 text-purple-800';
    else if (roleId === 3) colorClasses = 'bg-blue-100 text-blue-800';
    else if (roleId === 4) colorClasses = 'bg-yellow-100 text-yellow-800';

    return (
        <span className={`px-2.5 py-0.5 inline-flex text-xs font-semibold rounded-full whitespace-nowrap ${colorClasses}`}>
            {roleName}
        </span>
    );
};

const CommissionStatusBadge = ({ status }) => {
    const s = String(status || '').toLowerCase();
    let style = { text: status || '-', color: 'bg-gray-100 text-gray-600' };

    if (s === 'active' || s === 'hoạt động') style = { text: 'Hoạt động', color: 'bg-green-100 text-green-800' };
    else if (s === 'inactive' || s === 'ngừng') style = { text: 'Ngừng', color: 'bg-red-100 text-red-800' };

    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${style.color}`}>
            {style.text}
        </span>
    );
};

// --- COMPONENT CHÍNH ---
const CommissionPage = () => {
    const { setPageTitle } = useOutletContext();
    
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterRoleId, setFilterRoleId] = useState('');
    
    // State phân trang
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setPageTitle('Quản lý Quy tắc Hoa hồng');
        fetchRules();
    }, [setPageTitle]);

    const fetchRules = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get('/api/commission-rules');
            // Xử lý linh hoạt data trả về (đề phòng BE trả về dạng mảng hoặc object chứa data)
            setRules(Array.isArray(res.data) ? res.data : (res.data?.data || []));
        } catch (err) {
            console.error("Error fetching rules:", err);
            setError('Không thể tải dữ liệu quy tắc.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRule = async (ruleId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa quy tắc này không?')) return;

        try {
            await axiosClient.delete(`/api/commission-rules/${ruleId}`);
            setRules(prev => prev.filter(r => r.rule_id !== ruleId));
            alert('Đã xóa thành công!');
        } catch (err) {
            alert('Xóa thất bại: ' + (err.response?.data?.message || err.message));
        }
    };

    // Reset trang về 1 khi thay đổi bộ lọc
    useEffect(() => {
        setCurrentPage(1);
    }, [filterRoleId]);

    // --- LOGIC LỌC & PHÂN TRANG ---
    const filteredRules = useMemo(() => {
        if (!filterRoleId) return rules;
        return rules.filter(r => String(r.role_id) === filterRoleId);
    }, [rules, filterRoleId]);

    const totalPages = Math.ceil(filteredRules.length / ITEMS_PER_PAGE);
    
    const paginatedRules = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredRules.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredRules, currentPage]);

    // Render Pagination Controls
    const renderPagination = () => {
        if (totalPages <= 1) return null;
        
        let pages = [];
        // Giới hạn hiển thị tối đa 5 nút trang để không bị vỡ layout nếu quá nhiều trang
        const maxVisiblePages = 5;
        const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`w-8 h-8 rounded border text-sm font-medium transition-colors ${
                        currentPage === i 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-300'
                    }`}
                >
                    {i}
                </button>
            );
        }
        return (
            <div className="flex items-center gap-1">
                <button 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
                    disabled={currentPage === 1}
                    className="w-8 h-8 flex items-center justify-center rounded border bg-white disabled:opacity-50 hover:bg-gray-50"
                >
                    &lt;
                </button>
                {pages}
                <button 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} 
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded border bg-white disabled:opacity-50 hover:bg-gray-50"
                >
                    &gt;
                </button>
            </div>
        );
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            {/* Header & Filter */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <LuFilter className="text-gray-500" />
                    <select 
                        className="bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5 focus:ring-blue-500 outline-none min-w-[200px]"
                        value={filterRoleId}
                        onChange={(e) => setFilterRoleId(e.target.value)}
                    >
                        <option value="">Tất cả vai trò</option>
                        {STATIC_ROLES.map(r => <option key={r.role_id} value={r.role_id}>{r.role_name}</option>)}
                    </select>
                </div>
                <Link to="/admin/commission/new" className="flex items-center gap-2 bg-blue-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <LuPlus size={20} /> Tạo quy tắc mới
                </Link>
            </div>

            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3">ID</th>
                            <th className="px-6 py-3">Vai trò</th>
                            <th className="px-6 py-3">Doanh số (Min - Max)</th>
                            <th className="px-6 py-3">Hoa hồng</th>
                            <th className="px-6 py-3">Danh mục</th>
                            {/* --- ĐÃ THÊM LẠI CỘT THỜI GIAN --- */}
                            <th className="px-6 py-3">Thời gian</th>
                            <th className="px-6 py-3">Trạng thái</th>
                            <th className="px-6 py-3 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="8" className="text-center py-8">Đang tải...</td></tr>
                        ) : paginatedRules.length === 0 ? (
                            <tr><td colSpan="8" className="text-center py-8 text-gray-500">Chưa có quy tắc nào.</td></tr>
                        ) : (
                            paginatedRules.map((rule) => (
                                <tr key={rule.rule_id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium">{rule.rule_id}</td>
                                    <td className="px-6 py-4">
                                        <RoleBadge roleId={rule.role_id} />
                                    </td>
                                    <td className="px-6 py-4">
                                        {formatCurrency(rule.min_sales)} - {rule.max_sales ? formatCurrency(rule.max_sales) : '∞'}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-blue-600">{rule.commission_rate}%</td>
                                    <td className="px-6 py-4">{rule.product_category || 'Tất cả'}</td>
                                    
                                    {/* --- ĐÃ THÊM LẠI DỮ LIỆU THỜI GIAN --- */}
                                    <td className="px-6 py-4 text-xs">
                                        <div className="text-gray-900 font-medium">BĐ: {formatDate(rule.start_date)}</div>
                                        <div className="text-gray-500">KT: {rule.end_date ? formatDate(rule.end_date) : 'Vô thời hạn'}</div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <CommissionStatusBadge status={rule.status} />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-3">
                                            <Link to={`/admin/commission/edit/${rule.rule_id}`} className="text-gray-400 hover:text-blue-600" title="Sửa">
                                                <LuPencil size={18} />
                                            </Link>
                                            <button onClick={() => handleDeleteRule(rule.rule_id)} className="text-gray-400 hover:text-red-600" title="Xóa">
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

            {/* Pagination Footer */}
            {!loading && filteredRules.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
                    <p className="text-sm text-gray-500">
                        Hiển thị <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> đến <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredRules.length)}</span> trong tổng số <span className="font-medium">{filteredRules.length}</span> quy tắc
                    </p>
                    {renderPagination()}
                </div>
            )}
        </div>
    );
};

export default CommissionPage;