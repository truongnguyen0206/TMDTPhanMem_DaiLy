import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';

const AddAccountPage = () => {
    const { setPageTitle } = useOutletContext();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('manually');
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        department: '',
        cccd: '',
        phone: '',
        tier: ''
    });

    useEffect(() => {
        // Giữ tiêu đề trang chính là "Tài khoản" cho nhất quán
        setPageTitle('Tài khoản'); 
    }, [setPageTitle]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Xử lý logic gửi form tại đây
        console.log("Dữ liệu form đã gửi:", formData);
        alert('Tài khoản đã được thêm (chức năng đang phát triển, vui lòng kiểm tra console)!');
        navigate('/admin/accounts'); // Quay về trang danh sách sau khi thêm
    };

    return (
        <div className="bg-white p-8 rounded-xl border border-gray-200 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Thêm Tài Khoản</h2>

            {/* Tabs */}
            <div className="flex border-b mb-6">
                <button
                    onClick={() => setActiveTab('manually')}
                    className={`py-2 px-4 text-sm font-medium ${activeTab === 'manually' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Manually
                </button>
                <button
                    onClick={() => setActiveTab('csv')}
                    className={`py-2 px-4 text-sm font-medium ${activeTab === 'csv' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Import CSV
                </button>
            </div>

            {/* Form thêm thủ công */}
            {activeTab === 'manually' && (
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {/* Cột trái */}
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Họ Và Tên</label>
                            <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" required />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" required />
                        </div>
                         <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" required />
                        </div>
                        <div>
                            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Bộ Phận</label>
                            <select name="department" id="department" value={formData.department} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent">
                                <option value="">Bộ Phận</option>
                                <option value="dai-ly">Đại lý</option>
                                <option value="ctv">Cộng tác viên</option>
                            </select>
                        </div>

                        {/* Cột phải */}
                         <div>
                            <label htmlFor="cccd" className="block text-sm font-medium text-gray-700 mb-1">CCCD</label>
                            <input type="text" name="cccd" id="cccd" value={formData.cccd} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Số Điện Thoại</label>
                            <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent" />
                        </div>
                        <div>
                            <label htmlFor="tier" className="block text-sm font-medium text-gray-700 mb-1">Tier</label>
                             <select name="tier" id="tier" value={formData.tier} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent">
                                <option value="">Tier</option>
                                <option value="Gold">Gold</option>
                                <option value="Silver">Silver</option>
                                <option value="Slow">Slow</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-8">
                        <button type="submit" className="bg-gray-200 text-gray-800 font-bold py-2 px-8 rounded-lg hover:bg-gray-300 transition-colors">
                            Thêm
                        </button>
                    </div>
                </form>
            )}
             {activeTab === 'csv' && (
                <div>
                    <p className="text-gray-600">Tính năng Import CSV đang được phát triển.</p>
                    {/* Bạn có thể thêm giao diện upload file ở đây */}
                </div>
            )}
        </div>
    );
};

export default AddAccountPage;