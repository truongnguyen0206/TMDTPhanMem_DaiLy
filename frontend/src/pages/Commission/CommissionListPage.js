import React from 'react';
import { FaSearch, FaPen, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// Dữ liệu mẫu
const commissionRules = [
  { id: 1, name: 'VPharma', status: 'Pending', commission: '5%', validity: '01/01/2025-20/12/2025', creator: 'ADMIN' },
  { id: 2, name: 'Shopping', status: 'Active', commission: '100.000đ', validity: '01/01/2025-20/12/2025', creator: 'ADMIN' },
  { id: 3, name: 'Spam App', status: 'Inactive', commission: '7%', validity: '01/01/2025-20/12/2025', creator: 'ADMIN' },
];

const CommissionListPage = () => {
    const navigate = useNavigate();

    const handleEdit = (id) => {
        // Chuyển đến trang chi tiết/sửa với ID tương ứng
        navigate(`/commissions/edit/${id}`);
    };

    const statusClasses = {
        'Active': 'bg-green-100 text-green-700',
        'Pending': 'bg-yellow-100 text-yellow-700',
        'Inactive': 'bg-gray-200 text-gray-600',
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <div className="relative w-1/3">
                        <FaSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b bg-gray-50">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-gray-600 uppercase">Phần Mềm</th>
                                <th className="p-4 text-sm font-semibold text-gray-600 uppercase">Trạng Thái</th>
                                <th className="p-4 text-sm font-semibold text-gray-600 uppercase">Hoa Hồng</th>
                                <th className="p-4 text-sm font-semibold text-gray-600 uppercase">Hiệu Lực</th>
                                <th className="p-4 text-sm font-semibold text-gray-600 uppercase">Người Tạo</th>
                                <th className="p-4 text-sm font-semibold text-gray-600 uppercase">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {commissionRules.map(rule => (
                                <tr key={rule.id} className="border-b hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-sm text-gray-800 font-medium">{rule.name}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[rule.status]}`}>
                                            {rule.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">{rule.commission}</td>
                                    <td className="p-4 text-sm text-gray-600">{rule.validity}</td>
                                    <td className="p-4 text-sm text-gray-600">{rule.creator}</td>
                                    <td className="p-4 flex items-center gap-4">
                                        <button onClick={() => handleEdit(rule.id)} className="text-gray-400 hover:text-blue-600 transition-colors">
                                            <FaPen />
                                        </button>
                                        <button className="text-gray-400 hover:text-red-600 transition-colors">
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-6">
                    <button className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                        Thêm Quy Tắc
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CommissionListPage;