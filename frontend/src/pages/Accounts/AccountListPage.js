import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaPen, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

const AccountListPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Sử dụng axiosClient, không cần truyền token nữa
      const res = await axiosClient.get('/users');
      setUsers(res.data);
    } catch (err) {
      setError('Không thể tải dữ liệu người dùng.');
      console.error("Lỗi fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId, username) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${username}" không?`)) {
      try {
        // Sử dụng axiosClient
        await axiosClient.delete(`/users/${userId}`);
        setUsers(users.filter(user => user.user_id !== userId));
        alert("Xóa tài khoản thành công!");
      } catch (err) {
        setError('Xóa tài khoản thất bại.');
        console.error("Lỗi khi xóa user:", err);
      }
    }
  };
  // -------------------------

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };
  
  if (loading) return <div className="p-8">Đang tải dữ liệu...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Quản Lý Tài Khoản</h1>
        <div className="flex items-center gap-3">
          <Link
            to="/accounts/new"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <FaPlus />
            Thêm Tài Khoản
          </Link>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="relative mb-4">
          <FaSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="p-4 text-sm font-semibold text-gray-600 uppercase">Username</th>
                <th className="p-4 text-sm font-semibold text-gray-600 uppercase">Email</th>
                <th className="p-4 text-sm font-semibold text-gray-600 uppercase">Vai trò</th>
                <th className="p-4 text-sm font-semibold text-gray-600 uppercase">Số điện thoại</th>
                <th className="p-4 text-sm font-semibold text-gray-600 uppercase">Ngày tạo</th>
                <th className="p-4 text-sm font-semibold text-gray-600 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.user_id} className="border-b hover:bg-blue-50">
                  <td className="p-4 text-sm text-gray-800 font-medium">{user.username}</td>
                  <td className="p-4 text-sm text-gray-600">{user.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role_name === 'Admin' ? 'bg-red-100 text-red-700' :
                      user.role_name === 'DaiLy' ? 'bg-green-100 text-green-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role_name}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{user.phone}</td>
                  <td className="p-4 text-sm text-gray-600">{formatDate(user.created_at)}</td>
                  <td className="p-4 flex items-center gap-4">
                    <Link to={`/accounts/edit/${user.user_id}`} className="text-gray-400 hover:text-blue-600">
                      <FaPen />
                    </Link>
                    {/* GỌI HÀM XÓA KHI CLICK VÀO NÚT */}
                    <button onClick={() => handleDelete(user.user_id, user.username)} className="text-gray-400 hover:text-red-600">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccountListPage;