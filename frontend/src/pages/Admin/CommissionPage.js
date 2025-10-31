import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient'; // Import axiosClient
import { LuPlus, LuPencil, LuTrash2, LuFilter } from 'react-icons/lu'; // Thêm icons

// Hàm format tiền tệ (có thể tái sử dụng nếu cần)
const formatCurrency = (value) => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

// Hàm format ngày (có thể tái sử dụng)
const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
        return new Date(dateString).toLocaleDateString('vi-VN');
    } catch (e) {
        return '-';
    }
};

const CommissionPage = () => {
    const { setPageTitle } = useOutletContext();
    // --- State cho dữ liệu, loading, lỗi ---
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [roles, setRoles] = useState([]); // State để lưu danh sách roles cho bộ lọc
    const [filterRoleId, setFilterRoleId] = useState(''); // State cho bộ lọc theo vai trò

    useEffect(() => {
        setPageTitle('Quản lý Quy tắc Hoa hồng');

        // --- Fetch dữ liệu ---
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                // Lấy danh sách quy tắc
                const rulesResponse = await axiosClient.get('/api/commission-rules'); //
                setRules(rulesResponse.data?.data || []); // API trả về { success, data, message }

                // Lấy danh sách vai trò để lọc
                const rolesResponse = await axiosClient.get('/roles'); //
                setRoles(rolesResponse.data || []);
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu:", err);
                setError('Không thể tải dữ liệu quy tắc hoa hồng. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [setPageTitle]);

    // --- Hàm xử lý xóa quy tắc ---
    const handleDeleteRule = async (ruleId) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa quy tắc hoa hồng ID: ${ruleId} không?`)) {
            try {
                setError('');
                await axiosClient.delete(`/api/commission-rules/${ruleId}`); //
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

    // --- Lọc danh sách quy tắc ---
    const filteredRules = useMemo(() => {
        if (!filterRoleId) {
            return rules;
        }
        return rules.filter(rule => String(rule.role_id) === filterRoleId);
    }, [rules, filterRoleId]);

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200">
            {/* Header: Tiêu đề, Bộ lọc, Nút Thêm mới */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-gray-800">Danh sách Quy tắc Hoa hồng</h2>
                <div className="flex items-center gap-4">
                     {/* Bộ lọc theo vai trò */}
                    <div className="flex items-center gap-2">
                         <LuFilter size={18} className="text-gray-500" />
                        <select
                            value={filterRoleId}
                            onChange={(e) => setFilterRoleId(e.target.value)}
                            className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-auto text-sm"
                        >
                            <option value="">Lọc theo vai trò</option>
                            {roles.map(role => (
                                <option key={role.role_id} value={role.role_id}>
                                    {role.role_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* Nút Thêm mới */}
                    <Link
                        to="/admin/commission/new" //
                        className="flex items-center gap-2 bg-primary text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                        <LuPlus size={20} />
                        Tạo quy tắc mới
                    </Link>
                </div>
            </div>

            {/* Hiển thị lỗi */}
            {error && <p className="text-red-600 text-center mb-4">{error}</p>}

            {/* Bảng dữ liệu */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">ID</th>
                            <th scope="col" className="px-6 py-3">Vai trò</th>
                            <th scope="col" className="px-6 py-3">Doanh số (Min)</th>
                            <th scope="col" className="px-6 py-3">Doanh số (Max)</th>
                            <th scope="col" className="px-6 py-3">Tỷ lệ (%)</th>
                            <th scope="col" className="px-6 py-3">Danh mục SP</th>
                            <th scope="col" className="px-6 py-3">Ngày bắt đầu</th>
                            <th scope="col" className="px-6 py-3">Ngày kết thúc</th>
                            <th scope="col" className="px-6 py-3">Mô tả</th>
                            <th scope="col" className="px-6 py-3 text-right">Hành động</th>
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
                                    {/* Giả sử API trả về role_name */}
                                    <td className="px-6 py-4">{rule.role_name || rule.role_id}</td>
                                    <td className="px-6 py-4">{formatCurrency(rule.min_sales)}</td>
                                    <td className="px-6 py-4">{rule.max_sales ? formatCurrency(rule.max_sales) : 'Không giới hạn'}</td>
                                    <td className="px-6 py-4 font-semibold">{rule.commission_rate}%</td>
                                    <td className="px-6 py-4">{rule.product_category || '-'}</td>
                                    <td className="px-6 py-4">{formatDate(rule.start_date)}</td>
                                    <td className="px-6 py-4">{rule.end_date ? formatDate(rule.end_date) : 'Vô thời hạn'}</td>
                                    <td className="px-6 py-4 text-xs">{rule.description || '-'}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            {/* Nút Sửa */}
                                            <Link
                                                to={`/admin/commission/edit/${rule.rule_id}`} //
                                                className="text-gray-400 hover:text-blue-600"
                                                title="Sửa quy tắc"
                                            >
                                                <LuPencil size={18} />
                                            </Link>
                                            {/* Nút Xóa */}
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