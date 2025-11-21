import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { LuSearch, LuPencil, LuTrash2, LuPlus } from 'react-icons/lu';
import { useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ITEMS_PER_PAGE = 10;

// ... (component StatusBadge giữ nguyên) ...
const StatusBadge = ({ status }) => {
    const { t } = useTranslation();
    let style = {};
    switch (status?.toLowerCase()) {
        case 'đang hoạt động':
            style = { text: t('status.active'), color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
            break;
        case 'cần hoàn đồng': // Giữ key gốc nếu cần
            style = { text: t('status.pendingApproval'), color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' };
            break;
        case 'ngừng hoạt động':
            style = { text: t('status.inactive'), color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' };
            break;
        default:
            style = { text: status || t('status.unknown'), color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' };
    }
    return <span className={`px-3 py-1 text-xs font-bold rounded-full ${style.color}`}>{style.text}</span>;
};

const AgentsPage = () => {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const { setPageTitle } = useOutletContext();
    const [searchTerm, setSearchTerm] = useState('');
    const { t, i18n } = useTranslation();

    useEffect(() => {
        setPageTitle(t('npp.agents.title'));
        const fetchAgents = async () => {
            setLoading(true);
            try {
                const response = await axiosClient.get('/agent/getAllAgents'); // <-- Sửa ở đây
                const agentData = response.data;
                const agentsWithStatus = agentData.map((agent, index) => {
                    const statuses = ['Đang hoạt động', 'Cần hoàn đồng', 'Ngừng hoạt động'];
                    const idForStatus = agent.user_id || agent.agent_id || index;
                    return {
                        ...agent,
                        username: agent.agent_name, // <-- Hiển thị tên đại lý
                        status: statuses[idForStatus % statuses.length],
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
    }, [setPageTitle, t, i18n.language]);

    // ... (Hàm handleDeleteAgent giữ nguyên) ...
    const handleDeleteAgent = async (agentId) => {
        const confirmDelete = window.confirm(t('npp.agents.confirmDelete'));
        if (confirmDelete) {
            try {
                await axiosClient.delete(`/agent/deleteAgent/${agentId}`); // Gọi đúng base path /agents
                setAgents(prevAgents => prevAgents.filter(agent => agent.user_id !== agentId));
                alert(t('npp.agents.deleteSuccess'));
            } catch (error) {
                console.error("Lỗi khi xóa đại lý:", error);
                const errorMessage = error.response?.data?.message || t('npp.agents.deleteError');
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
             pages.push(<button key={1} onClick={() => setCurrentPage(1)} className={`px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 border dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600`}>1</button>);
             if (startPage > 2) {
                 pages.push(<span key="dots-start" className="px-3 py-1">...</span>);
             }
         }
         for (let i = startPage; i <= endPage; i++) {
             pages.push(
                 <button
                     key={i}
                     onClick={() => setCurrentPage(i)}
                     className={`px-3 py-1 rounded-md ${currentPage === i ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'}`}
                 >
                     {i}
                 </button>
             );
         }
         if (endPage < totalPages) {
             if (endPage < totalPages - 1) {
                 pages.push(<span key="dots-end" className="px-3 py-1">...</span>);
             }
             pages.push(<button key={totalPages} onClick={() => setCurrentPage(totalPages)} className={`px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 border dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600`}>{totalPages}</button>);
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
            <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
                 <div className="flex justify-between items-center mb-6">
                     <div className="relative">
                         <input
                             type="text"
                             placeholder={t('npp.agents.searchPlaceholder')}
                             value={searchTerm}
                             onChange={handleSearchChange}
                             className="w-80 bg-light-gray border border-border-color rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                         />
                         <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                     </div>
                     <Link
                         to="/npp/agents/new"
                         className="flex items-center gap-2 bg-green-500 text-white font-bold px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                     >
                        <LuPlus size={20} />
                        {t('npp.agents.addAgent')}
                     </Link>
                 </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                         <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                               <th scope="col" className="px-6 py-3">{t('npp.agents.agentCodeHeader')}</th> {/* Dịch header */}
                                <th scope="col" className="px-6 py-3">{t('npp.agents.agentNameHeader')}</th> {/* Dịch header */}
                                <th scope="col" className="px-6 py-3">{t('npp.agents.statusHeader')}</th> {/* Dịch header */}
                                <th scope="col" className="px-6 py-3">{t('npp.agents.createdDateHeader')}</th> {/* Dịch header */}
                                <th scope="col" className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-4 dark:text-gray-400">{t('general.loading')}</td></tr>
                            ) : paginatedAgents.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-4 dark:text-gray-400">{t('npp.agents.notFound')}</td></tr>
                            ) : (
                                paginatedAgents.map((agent) => (
                                    // Sử dụng agent_id từ bảng agent làm key nếu user_id có thể null
                                    <tr key={agent.agent_id || agent.user_id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            {/* Hiển thị agent_code */}
                                            {agent.agent_code || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 dark:text-white">
                                            {/* Hiển thị agent_name */}
                                            {agent.agent_name || agent.username || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4"><StatusBadge status={agent.status} /></td>
                                        <td className="px-6 py-4 dark:text-gray-300">
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
                                                className="text-gray-400 hover:text-red-600 dark:hover:text-red-500"><LuTrash2 size={18} /></button>
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
                     <p className="text-sm text-gray-500 dark:text-gray-400">
                         {t('general.showingResults', {
                             start: paginatedAgents.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0,
                             end: (currentPage - 1) * ITEMS_PER_PAGE + paginatedAgents.length,
                             total: filteredAgents.length
                         })}
                     </p>
                     {totalPages > 1 && (
                         <div className="flex items-center gap-2">
                             <button
                                 onClick={handlePrevPage}
                                 disabled={currentPage === 1}
                                 className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 border dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                             >
                                 {'<'}
                             </button>
                             {renderPagination()}
                             <button
                                 onClick={handleNextPage}
                                 disabled={currentPage === totalPages}
                                 className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 border dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
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

