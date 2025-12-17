import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { LuPlus, LuPencil, LuTrash2, LuFilter } from 'react-icons/lu';

// ✅ 1. DANH SÁCH ROLE CỐ ĐỊNH
const STATIC_ROLES = [
    { role_id: 1, role_name: 'Admin' },
    { role_id: 2, role_name: 'Nhà phân phối' },
    { role_id: 3, role_name: 'Đại lý' },
    { role_id: 4, role_name: 'Cộng tác viên' },
    { role_id: 5, role_name: 'Khách hàng' }
];

// --- HELPER FUNCTIONS ---
const formatCurrency = (value) => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
        return new Date(dateString).toLocaleDateString('vi-VN');
    } catch (e) {
        return '-';
    }
};

// --- COMPONENTS CON ---

// 1. Badge cho Vai trò (Giữ nguyên)
const RoleBadge = ({ roleId }) => {
    const role = STATIC_ROLES.find(r => r.role_id === roleId);
    const roleName = role ? role.role_name : `Unknown ID: ${roleId}`;
    let colorClasses = 'bg-gray-100 text-gray-800';

    switch (roleId) {
        case 1: colorClasses = 'bg-red-100 text-red-800'; break;
        case 2: colorClasses = 'bg-purple-100 text-purple-800'; break;
        case 3: colorClasses = 'bg-blue-100 text-blue-800'; break;
        case 4: colorClasses = 'bg-yellow-100 text-yellow-800'; break;
        case 5: colorClasses = 'bg-green-100 text-green-800'; break;
        default: colorClasses = 'bg-gray-100 text-gray-600';
    }

    return (
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full whitespace-nowrap ${colorClasses}`}>
            {roleName}
        </span>
    );
};

// 🆕 2. Badge cho Trạng thái (Mới thêm)
const CommissionStatusBadge = ({ status }) => {
    let style = { text: status || '-', color: 'bg-gray-100 text-gray-600' };
    
    // Chuẩn hóa status về chữ thường để so sánh hoặc so sánh trực tiếp nếu DB lưu chuẩn
    const s = status ? status : ''; 

    if (s === 'Active' || s === 'active') {
        style = { text: 'Hoạt động', color: 'bg-green-100 text-green-800' };
    } else if (s === 'Inactive' || s === 'inactive') {
        style = { text: 'Ngừng', color: 'bg-red-100 text-red-800' };
    } else if (s === 'Draft' || s === 'draft') {
        style = { text: 'Nháp', color: 'bg-gray-100 text-gray-800' };
    }

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

    useEffect(() => {
        setPageTitle('Quản lý Quy tắc Hoa hồng');

        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                const rulesResponse = await axiosClient.get('/api/commission-rules'); 
                setRules(rulesResponse.data?.data || []);
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu:", err);
                setError('Không thể tải dữ liệu quy tắc hoa hồng. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [setPageTitle]);

    const handleDeleteRule = async (ruleId) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa quy tắc hoa hồng ID: ${ruleId} không?`)) {
            try {
                setError('');
                await axiosClient.delete(`/api/commission-rules/${ruleId}`);
                setRules(prevRules => prevRules.filter(rule => rule.rule_id !== ruleId));
                alert(`Đã xóa thành công quy tắc ID: ${ruleId}.`);
            } catch (err) {
                console.error("Lỗi khi xóa quy tắc:", err);
                const apiError = err.response?.data?.message || err.message || 'Xóa quy tắc thất bại.';
                setError(`Lỗi: ${apiError}`);
                alert(`Lỗi khi xóa quy tắc: ${apiError}`);
            }
        }
    };

    const filteredRules = useMemo(() => {
        if (!filterRoleId) return rules;
        return rules.filter(rule => String(rule.role_id) === filterRoleId);
    }, [rules, filterRoleId]);

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-gray-800">Danh sách Quy tắc Hoa hồng</h2>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                         <LuFilter size={18} className="text-gray-500" />
                        <select
                            value={filterRoleId}
                            onChange={(e) => setFilterRoleId(e.target.value)}
                            className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-auto text-sm"
                        >
                            <option value="">Lọc theo vai trò</option>
                            {STATIC_ROLES.map(role => (
                                <option key={role.role_id} value={role.role_id}>
                                    {role.role_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <Link
                        to="/admin/commission/new"
                        className="flex items-center gap-2 bg-primary text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                        <LuPlus size={20} />
                        Tạo quy tắc mới
                    </Link>
                </div>
            </div>

            {error && <p className="text-red-600 text-center mb-4">{error}</p>}

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">ID</th>
                            <th className="px-6 py-3">Vai trò</th>
                            <th className="px-6 py-3">Trạng thái</th> {/* 🆕 Cột Mới */}
                            <th className="px-6 py-3">Doanh số (Min)</th>
                            <th className="px-6 py-3">Doanh số (Max)</th>
                            <th className="px-6 py-3">Tỷ lệ (%)</th>
                            <th className="px-6 py-3">Danh mục SP</th>
                            <th className="px-6 py-3">Thời gian</th> {/* Gộp Start/End cho gọn */}
                            <th className="px-6 py-3">Mô tả</th>
                            <th className="px-6 py-3 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="10" className="text-center py-10 text-gray-500">Đang tải dữ liệu...</td></tr>
                        ) : filteredRules.length === 0 ? (
                            <tr><td colSpan="10" className="text-center py-10 text-gray-500">Không tìm thấy quy tắc nào.</td></tr>
                        ) : (
                            filteredRules.map((rule) => (
                                <tr key={rule.rule_id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{rule.rule_id}</td>
                                    
                                    <td className="px-6 py-4">
                                        <RoleBadge roleId={rule.role_id} />
                                    </td>

                                    {/* 🆕 Hiển thị Trạng thái */}
                                    <td className="px-6 py-4">
                                        <CommissionStatusBadge status={rule.status} />
                                    </td>

                                    <td className="px-6 py-4">{formatCurrency(rule.min_sales)}</td>
                                    <td className="px-6 py-4">{rule.max_sales ? formatCurrency(rule.max_sales) : 'Không giới hạn'}</td>
                                    <td className="px-6 py-4 font-semibold text-blue-600">{rule.commission_rate}%</td>
                                    <td className="px-6 py-4">{rule.product_category || 'Tất cả'}</td>
                                    
                                    {/* Hiển thị thời gian gộp cho gọn */}
                                    <td className="px-6 py-4 text-xs">
                                        <div className="text-gray-900">BĐ: {formatDate(rule.start_date)}</div>
                                        <div className="text-gray-500">KT: {rule.end_date ? formatDate(rule.end_date) : 'Vô thời hạn'}</div>
                                    </td>
                                    
                                    <td className="px-6 py-4 text-xs max-w-[150px] truncate" title={rule.description}>
                                        {rule.description || '-'}
                                    </td>
                                    
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <Link
                                                to={`/admin/commission/edit/${rule.rule_id}`}
                                                className="text-gray-400 hover:text-blue-600"
                                                title="Sửa quy tắc"
                                            >
                                                <LuPencil size={18} />
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteRule(rule.rule_id)}
                                                className="text-gray-400 hover:text-red-600"
                                                title="Xóa quy tắc"
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
            {/* Có thể thêm phân trang nếu cần */}
        </div>
    );
};

export default CommissionPage;