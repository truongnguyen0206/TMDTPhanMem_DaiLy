import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { LuSearch, LuPencil, LuTrash2, LuPlus, LuCalendarDays } from 'react-icons/lu';
import { useOutletContext } from 'react-router-dom';

// ... (component StatusBadge giữ nguyên) ...
const StatusBadge = ({ status }) => {
    let style = {};
    switch (status.toLowerCase()) {
        case 'đang hoạt động':
            style = { text: 'Đang hoạt động', color: 'bg-green-100 text-green-800' };
            break;
        case 'cần hoàn đồng':
            style = { text: 'Đang chờ cấp tài khoản', color: 'bg-yellow-100 text-yellow-800' };
            break;
        case 'ngừng hoạt động':
            style = { text: 'Ngừng hoạt động', color: 'bg-red-100 text-red-800' };
            break;
        default:
            style = { text: status, color: 'bg-gray-100 text-gray-800' };
    }

    return (
        <span className={`px-3 py-1 text-xs font-bold rounded-full ${style.color}`}>
            {style.text}
        </span>
    );
};

const AgentsPage = () => {
    // ... (phần state, useEffect, renderPagination giữ nguyên) ...
     const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 10; // Giả sử
    const { setPageTitle } = useOutletContext();
    const [searchTerm, setSearchTerm] = useState(''); 

    useEffect(() => {
        setPageTitle('Đại lý');
        const fetchAgents = async () => {
            setLoading(true);
            try {
                // Gọi API lấy tất cả user đã có sẵn
                const response = await axiosClient.get('/users');
                // Lọc ra những user có vai trò là 'Agent'
                const agentData = response.data.filter(user => user.role_name === 'Agent');

                // Thêm trạng thái giả lập để giống với giao diện
                const agentsWithStatus = agentData.map((agent, index) => {
                    const statuses = ['Đang hoạt động', 'Cần hoàn đồng', 'Ngừng hoạt động'];
                    return {
                        ...agent,
                        // Dùng id để tạo trạng thái giả lập một cách ổn định
                        status: statuses[agent.user_id % statuses.length], 
                    };
                });

                setAgents(agentsWithStatus);
            } catch (error) {
                console.error("Lỗi khi tải danh sách đại lý:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAgents();
    }, [setPageTitle]);

    // Hàm xử lý xóa đại lý
    const handleDeleteAgent = async (agentId) => {
        const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa đại lý này không? Hành động này không thể hoàn tác.');

        if (confirmDelete) {
            try {
                // Gọi API DELETE đến endpoint đã định nghĩa trong BE: /agents/deleteAgent/:agentId
                await axiosClient.delete(`agent/deleteAgent/${agentId}`);

                // Xóa thành công, cập nhật state để loại bỏ đại lý khỏi danh sách
                setAgents(prevAgents => prevAgents.filter(agent => agent.user_id !== agentId));
                alert('Đại lý đã được xóa thành công.');
            } catch (error) {
                console.error("Lỗi khi xóa đại lý:", error);
                // Hiển thị thông báo lỗi chi tiết từ server (nếu có)
                const errorMessage = error.response?.data?.message || 'Xóa đại lý thất bại. Vui lòng kiểm tra log Backend.';
                alert(errorMessage);
            }
        }
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        // Có thể reset trang về 1 khi tìm kiếm mới
        setCurrentPage(1); 
    };

    // **Sử dụng useMemo để lọc danh sách Đại lý**
    const filteredAgents = useMemo(() => {
        if (!searchTerm) {
            return agents;
        }

        const searchLower = searchTerm.toLowerCase();

        return agents.filter(agent => {
            // Tạo mã đại lý (ví dụ: DL001) để tìm kiếm
            const agentCode = `DL${String(agent.user_id).padStart(3, '0')}`.toLowerCase();
            const agentName = agent.username.toLowerCase();

            // Tìm kiếm theo Mã Đại lý HOẶC Tên Đại lý
            return agentCode.includes(searchLower) || agentName.includes(searchLower);
        });
    }, [agents, searchTerm]);

    const renderPagination = () => {
        let pages = [];
        pages.push(<button key={1} onClick={() => setCurrentPage(1)} className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>1</button>);
        pages.push(<button key={2} onClick={() => setCurrentPage(2)} className={`px-3 py-1 rounded-md ${currentPage === 2 ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>2</button>);
        pages.push(<button key={3} onClick={() => setCurrentPage(3)} className={`px-3 py-1 rounded-md ${currentPage === 3 ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>3</button>);
        pages.push(<span key="dots" className="px-3 py-1">...</span>);
        pages.push(<button key={10} onClick={() => setCurrentPage(10)} className={`px-3 py-1 rounded-md ${currentPage === 10 ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>10</button>);
        return pages;
    };

    return (
        <div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Search by mã đại lý"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-80 bg-light-gray border border-border-color rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                    <Link 
                        to="/npp/agents/new"
                        className="flex items-center gap-2 bg-green-500 text-white font-bold px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                    >
                       <LuPlus size={20} />
                       Thêm đại lý
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        {/* ... (thead giữ nguyên) ... */}
                         <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Mã Đại Lý</th>
                                <th scope="col" className="px-6 py-3">Tên Đại Lý</th>
                                <th scope="col" className="px-6 py-3">Trạng Thái</th>
                                <th scope="col" className="px-6 py-3">Ngày Tạo</th>
                                <th scope="col" className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-4">Đang tải dữ liệu...</td></tr>
                            ) : filteredAgents.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-4">Không tìm thấy đại lý nào phù hợp với tìm kiếm.</td></tr>
                            ) : (
                                filteredAgents.map((agent) => (
                                    <tr key={agent.user_id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">DL{String(agent.user_id).padStart(3, '0')}</td>
                                        <td className="px-6 py-4">{agent.username}</td>
                                        <td className="px-6 py-4"><StatusBadge status={agent.status} /></td>
                                        <td className="px-6 py-4">{new Date(agent.created_at).toLocaleDateString('vi-VN')}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-4">
                                                {/* THAY THẾ <button> bằng <Link> */}
                                                <Link to={`/npp/agents/edit/${agent.user_id}`} className="text-gray-400 hover:text-green-600">
                                                    <LuPencil size={18} />
                                                </Link>
                                                <button
                                                onClick={() => handleDeleteAgent(agent.user_id)}
                                                className="text-gray-400 hover:text-red-600"><LuTrash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* ... (Phân trang giữ nguyên) ... */}
                <div className="flex justify-between items-center mt-6">
                    <p className="text-sm text-gray-500">Showing 1 to 10 of {agents.length} results</p>
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 border">{'<'}</button>
                        {renderPagination()}
                        <button className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 border">{'>'}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentsPage;