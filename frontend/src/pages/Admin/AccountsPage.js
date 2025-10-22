import React, { useState, useEffect } from 'react';
// Thêm Link từ react-router-dom
import { useOutletContext, Link } from 'react-router-dom'; 
// Thêm icon LuPlus
import { LuSearch, LuPencil, LuPlus } from 'react-icons/lu'; 

// Component RoleBadge giữ nguyên
const RoleBadge = ({ role }) => {
    // ... code của RoleBadge
};


const AccountsPage = () => {
    // ... các state và useEffect giữ nguyên
    const { setPageTitle } = useOutletContext();
    const [accounts, setAccounts] = useState(/* mockAccounts */);
    
    useEffect(() => {
        setPageTitle('Tài khoản');
    }, [setPageTitle]);


    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200">
            {/* Thanh tìm kiếm và bộ lọc */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm"
                            className="w-80 bg-gray-50 border border-gray-200 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                    <select className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary">
                        <option>Bộ Phận</option>
                        <option>Đại lý</option>
                        <option>Cộng tác viên</option>
                    </select>
                </div>

                {/* --- THÊM NÚT MỚI TẠI ĐÂY --- */}
                <Link
                    to="/admin/accounts/new"
                    className="flex items-center gap-2 bg-primary text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <LuPlus size={20} />
                    Thêm tài khoản
                </Link>
            </div>

            {/* Bảng dữ liệu và phân trang giữ nguyên */}
            {/* ... */}
        </div>
    );
};

export default AccountsPage;