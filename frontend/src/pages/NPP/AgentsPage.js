import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { LuSearch, LuPencil, LuTrash2, LuPlus, LuCalendarDays } from 'react-icons/lu';
import { useOutletContext } from 'react-router-dom';

const ITEMS_PER_PAGE = 10;

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
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const { setPageTitle } = useOutletContext();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setPageTitle('Đại lý');
        const fetchAgents = async () => {
            setLoading(true);
            try {
                // ================================================================
                // THAY ĐỔI API ENDPOINT ĐỂ KHỚP VỚI BACKEND
                // ================================================================
                const response = await axiosClient.get('/agent/getAllAgents'); // <-- Sửa ở đây

                // Dữ liệu trả về từ getAllAgents (model) có agent_code, agent_name,...
                // Nhưng thiếu username, email, phone, created_at từ bảng users.
                // Chúng ta sẽ hiển thị agent_name thay cho username.
                const agentData = response.data;

                // Thêm trạng thái giả lập
                const agentsWithStatus = agentData.map((agent, index) => {
                    const statuses = ['Đang hoạt động', 'Cần hoàn đồng', 'Ngừng hoạt động'];
                    // Giả sử API trả về user_id (nếu có) hoặc agent_id để tạo status giả
                    const idForStatus = agent.user_id || agent.agent_id || index;
                    return {
                        ...agent,
                        // Cập nhật username để hiển thị tên từ bảng agent
                        username: agent.agent_name, // <-- Hiển thị tên đại lý
                        status: statuses[idForStatus % statuses.length],
                        // Giả lập created_at nếu API không trả về
                        created_at: agent.created_at || agent.ngaythamgia || new Date().toISOString(),
                    };
                });

                setAgents(agentsWithStatus);
            } catch (error) {
                console.error("Lỗi khi tải danh sách đại lý:", error);
                // Kiểm tra nếu lỗi là 404 thì thông báo rõ hơn
                if (error.response && error.response.status === 404) {
                    alert("Lỗi: Không tìm thấy API endpoint '/agents/getAllAgents'. Vui lòng kiểm tra lại Backend.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAgents();
    }, [setPageTitle]);

    // ... (Hàm handleDeleteAgent giữ nguyên) ...
    const handleDeleteAgent = async (agentId) => {
        // Cần đảm bảo API xóa dùng đúng ID (agent_id hay user_id?)
        // Hiện tại đang dùng agentId (user_id từ FE) gọi API deleteAgent/:agentId (user_id)
        // Nếu API deleteAgent cần agent_id từ bảng member.agent thì cần sửa lại
        const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa đại lý này không? Hành động này không thể hoàn tác.');
        if (confirmDelete) {
            try {
                // Sử dụng user_id để xóa vì route backend /deleteAgent/:agentId đang mong đợi user_id
                await axiosClient.delete(`/agent/deleteAgent/${agentId}`); // Gọi đúng base path /agents
                setAgents(prevAgents => prevAgents.filter(agent => agent.user_id !== agentId));
                alert('Đại lý đã được xóa thành công.');
            } catch (error) {
                console.error("Lỗi khi xóa đại lý:", error);
                const errorMessage = error.response?.data?.message || 'Xóa đại lý thất bại. Vui lòng kiểm tra log Backend.';
                alert(errorMessage);
            }
        }
    };


    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    };

    const filteredAgents = useMemo(() => {
        if (!searchTerm) {
            return agents;
        }
        const searchLower = searchTerm.toLowerCase();

        return agents.filter(agent => {
            // Tìm kiếm bằng agent_code hoặc agent_name (từ bảng agent)
            const agentCode = agent.agent_code ? agent.agent_code.toLowerCase() : '';
            const agentName = agent.agent_name ? agent.agent_name.toLowerCase() : ''; // Dùng agent_name

            return agentCode.includes(searchLower) || agentName.includes(searchLower);
        });
    }, [agents, searchTerm]);

    // ... (Các hàm paginatedAgents, renderPagination, handlePrevPage, handleNextPage giữ nguyên) ...
    const totalPages = Math.ceil(filteredAgents.length / ITEMS_PER_PAGE);
    const paginatedAgents = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredAgents.slice(startIndex, endIndex);
    }, [filteredAgents, currentPage]);
    const renderPagination = () => {
         if (totalPages <= 1) return null;
         const pages = [];
         const maxPagesToShow = 5;
         let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
         let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
         if (endPage - startPage + 1 < maxPagesToShow) {
             startPage = Math.max(1, endPage - maxPagesToShow + 1);
         }
         if (startPage > 1) {
             pages.push(<button key={1} onClick={() => setCurrentPage(1)} className={`px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 border`}>1</button>);
             if (startPage > 2) {
                 pages.push(<span key="dots-start" className="px-3 py-1">...</span>);
             }
         }
         for (let i = startPage; i <= endPage; i++) {
             pages.push(
                 <button
                     key={i}
                     onClick={() => setCurrentPage(i)}
                     className={`px-3 py-1 rounded-md ${currentPage === i ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border'}`}
                 >
                     {i}
                 </button>
             );
         }
         if (endPage < totalPages) {
             if (endPage < totalPages - 1) {
                 pages.push(<span key="dots-end" className="px-3 py-1">...</span>);
             }
             pages.push(<button key={totalPages} onClick={() => setCurrentPage(totalPages)} className={`px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 border`}>{totalPages}</button>);
         }
         return pages;
    };
    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };
    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    return (
        <div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                 <div className="flex justify-between items-center mb-6">
                     <div className="relative">
                         <input
                             type="text"
                             placeholder="Tìm theo mã hoặc tên đại lý" // Cập nhật placeholder
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
                            ) : paginatedAgents.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-4">Không tìm thấy đại lý nào phù hợp.</td></tr>
                            ) : (
                                paginatedAgents.map((agent) => (
                                    // Sử dụng agent_id từ bảng agent làm key nếu user_id có thể null
                                    <tr key={agent.agent_id || agent.user_id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {/* Hiển thị agent_code */}
                                            {agent.agent_code || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {/* Hiển thị agent_name */}
                                            {agent.agent_name || agent.username || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4"><StatusBadge status={agent.status} /></td>
                                        <td className="px-6 py-4">
                                            {/* Hiển thị ngày tạo user hoặc ngày tham gia agent */}
                                            {new Date(agent.created_at || agent.ngaythamgia).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-4">
                                                {/* Link sửa vẫn dùng user_id vì route edit mong đợi user_id */}
                                                <Link to={`/npp/agents/edit/${agent.user_id}`} className="text-gray-400 hover:text-green-600">
                                                    <LuPencil size={18} />
                                                </Link>
                                                {/* Nút xóa dùng user_id */}
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

                {/* Phân trang */}
                 <div className="flex justify-between items-center mt-6">
                     <p className="text-sm text-gray-500">
                         Hiển thị {paginatedAgents.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}
                         đến {(currentPage - 1) * ITEMS_PER_PAGE + paginatedAgents.length}
                         trong tổng số {filteredAgents.length} kết quả
                     </p>
                     {totalPages > 1 && (
                         <div className="flex items-center gap-2">
                             <button
                                 onClick={handlePrevPage}
                                 disabled={currentPage === 1}
                                 className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 border disabled:opacity-50 disabled:cursor-not-allowed"
                             >
                                 {'<'}
                             </button>
                             {renderPagination()}
                             <button
                                 onClick={handleNextPage}
                                 disabled={currentPage === totalPages}
                                 className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 border disabled:opacity-50 disabled:cursor-not-allowed"
                             >
                                 {'>'}
                             </button>
                         </div>
                     )}
                 </div>
            </div>
        </div>
    );
};

export default AgentsPage;

