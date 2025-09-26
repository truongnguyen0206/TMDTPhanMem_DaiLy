import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const DetailRow = ({ label, value }) => (
    <div>
        <label className="block text-sm font-medium text-gray-500">{label}</label>
        <div className="mt-1 p-3 bg-gray-100 rounded-md text-gray-800">{value}</div>
    </div>
);

const CommissionDetailPage = () => {
    const navigate = useNavigate();

    // Dữ liệu mẫu
    const ruleDetails = {
        name: 'Phần mềm VPharma',
        status: 'Pending',
        creator: 'ADMIN',
        createdAt: '15/12/2024',
        updatedAt: '20/12/2024',
        appType: 'Loại A',
        tier: 'Tier 1',
        commissionType: 'Phần trăm',
        value: '5%',
        product: 'Sản phẩm X, Sản phẩm Y',
        channel: 'Đại lý, CTV',
        startDate: '01/01/2025',
        endDate: '20/12/2025',
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-3xl mx-auto">
                <button onClick={() => navigate('/commissions')} className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6">
                    <FaArrowLeft />
                    Quay lại
                </button>

                <div className="bg-white p-8 rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Chi Tiết</h1>
                    <div className="space-y-4">
                        <DetailRow label="Tên phần mềm" value={ruleDetails.name} />
                        <DetailRow label="Trạng Thái" value={ruleDetails.status} />
                        <DetailRow label="Người Tạo" value={ruleDetails.creator} />
                        <DetailRow label="Ngày Tạo" value={ruleDetails.createdAt} />
                        <DetailRow label="Cập Nhật" value={ruleDetails.updatedAt} />
                        
                        <h2 className="text-lg font-semibold text-gray-700 pt-4 border-t mt-6">Thông tin áp dụng</h2>
                        <DetailRow label="Loại Áp Dụng" value={ruleDetails.appType} />
                        <DetailRow label="Tier Áp Dụng" value={ruleDetails.tier} />
                        <DetailRow label="Kiểu hoa hồng" value={ruleDetails.commissionType} />
                        <DetailRow label="Giá trị" value={ruleDetails.value} />

                        <h2 className="text-lg font-semibold text-gray-700 pt-4 border-t mt-6">Điều kiện áp dụng</h2>
                        <DetailRow label="Sản phẩm áp dụng" value={ruleDetails.product} />
                        <DetailRow label="Kênh bán" value={ruleDetails.channel} />

                        <h2 className="text-lg font-semibold text-gray-700 pt-4 border-t mt-6">Thời gian hiệu lực</h2>
                        <DetailRow label="Bắt đầu" value={ruleDetails.startDate} />
                        <DetailRow label="Kết thúc" value={ruleDetails.endDate} />

                        <h2 className="text-lg font-semibold text-gray-700 pt-4 border-t mt-6">Lịch sử thay đổi</h2>
                        <DetailRow label="15/12/2024" value="Tạo mới bởi ADMIN" />
                        <DetailRow label="20/12/2024" value="Cập nhật trạng thái bởi ADMIN" />
                    </div>

                    <div className="mt-8 flex justify-end gap-4">
                        <button className="px-6 py-2 text-white font-semibold bg-blue-600 rounded-lg hover:bg-blue-700">Sửa</button>
                        <button className="px-6 py-2 text-gray-700 font-semibold bg-gray-200 rounded-lg hover:bg-gray-300">Sao Chép</button>
                        <button className="px-6 py-2 text-white font-semibold bg-red-600 rounded-lg hover:bg-red-700">Xóa</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommissionDetailPage;