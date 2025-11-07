import React, { useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { LuPlus } from 'react-icons/lu';

const CommissionPage = () => {
    const { setPageTitle } = useOutletContext();

    useEffect(() => {
        setPageTitle('Hoa hồng');
    }, [setPageTitle]);

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Danh sách Hoa hồng</h2>
                <Link
                    to="/admin/commission/new"
                    className="flex items-center gap-2 bg-primary text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <LuPlus size={20} />
                    Tạo hoa hồng mới
                </Link>
            </div>
            
            {/* Placeholder cho bảng dữ liệu */}
            <div className="text-center text-gray-500 py-10">
                <p>Bảng danh sách hoa hồng sẽ được hiển thị ở đây.</p>
            </div>
        </div>
    );
};

export default CommissionPage;