import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { LuSearch, LuPencil, LuTrash2, LuPlus } from 'react-icons/lu';
import { useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

const ITEMS_PER_PAGE = 10;

// Component StatusBadge với dark mode
const StatusBadge = ({ status }) => {
    const { t } = useTranslation();
    let style = {};
    switch (status?.toLowerCase()) {
        case 'đang hoạt động':
            style = { text: t('status.active'), color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
            break;
        case 'đang chờ cấp tài khoản':
            style = { text: t('status.pendingApproval'), color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' };
            break;
        case 'ngừng hoạt động':
            style = { text: t('status.inactive'), color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' };
            break;
        default:
            style = { text: t('status.unknown'), color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' };
    }
    return (
        <span className={`px-3 py-1 text-xs font-bold rounded-full ${style.color}`}>
            {style.text}
        </span>
    );
};


const CTVPage = () => {
    const { user } = useAuth();
    const [ctvs, setCtvs] = useState([]);
    const { t, i18n } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const { setPageTitle } = useOutletContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [agentId, setAgentId] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        const fetchAgentId = async () => {
            if (!user || !user.id) {
                console.error("User ID không tồn tại để lấy agent_id.");
                return;
            }
            try {
                 console.warn("Đang dùng cách lấy tất cả agents để tìm agent_id - nên tối ưu ở BE");
                 const allAgentsResponse = await axiosClient.get('/agent/getAllAgents');
                 const currentAgent = allAgentsResponse.data.find(agent => agent.user_id === user.id);
                 if (currentAgent && currentAgent.agent_id) {
                    setAgentId(currentAgent.agent_id);
                 } else {
                     console.error("Không tìm thấy agent_id tương ứng với user_id:", user.id);
                     alert("Không thể xác định thông tin đại lý của bạn.");
                 }
            } catch (error) {
                console.error("Lỗi khi lấy agent_id:", error);
                alert("Lỗi khi tải thông tin đại lý.");
            }
        };

        fetchAgentId();
    }, [user]); // Chỉ chạy khi user thay đổi

    useEffect(() => {
        setPageTitle(t('sidebar.ctv'));

        const fetchCtvs = async () => {
            if (!agentId) {
                 if (!loading) setLoading(false);
                 return;
            }
            setLoading(true);
            try {
                // === BƯỚC 1: Lấy danh sách CTV (API này BÂY GIỜ đã chứa 'status') ===
                const response = await axiosClient.get(`/agent/getctv/${agentId}`);
                const ctvData = response.data?.ctvList || [];

                // === BƯỚC 2: Map dữ liệu (Không cần N+1 nữa) ===
                const ctvsWithRealStatus = ctvData.map((ctv, index) => {
                    
                    // Lấy status từ object lồng nhau, nếu không có thì là 'Không rõ'
                    const realStatus = ctv.users_view ? ctv.users_view.status : 'unknown';

                    return {
                        ...ctv,
                        status: realStatus, // <-- Đọc status từ biến realStatus
                        created_at: ctv.created_at || ctv.ngaythamgia || new Date().toISOString()
                    };
                });
                
                setCtvs(ctvsWithRealStatus); // Cập nhật state

            } catch (error) {
                console.error(t('dl.ctv.errorLoading'), error);
                if (error.response && error.response.status === 404) {
                    setCtvs([]);
                    console.log(`Không tìm thấy CTV nào cho agent_id: ${agentId}`);
                } else {
                    alert(t('general.errorLoading'));
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCtvs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [agentId, setPageTitle, t, i18n.language]);

   const handleDeleteCtv = async (ctvIdToDelete) => {
        const confirmDelete = window.confirm(t('dl.ctv.confirmDelete')); // Dịch (cần thêm key mới)
        if (confirmDelete) {
            try {
                await axiosClient.delete(`/CTV/removeCTV/${ctvIdToDelete}`);
                setCtvs(prevCtvs => prevCtvs.filter(ctv => ctv.ctv_id !== ctvIdToDelete));
                alert(t('dl.ctv.deleteSuccess')); // Dịch (cần thêm key mới)
            } catch (error) {
                console.error(t('dl.ctv.errorDeleting'), error); // Dịch log lỗi (cần thêm key mới)
                const errorMessage = error.response?.data?.message || t('dl.ctv.deleteError'); // Dịch (cần thêm key mới)
                alert(errorMessage);
            }
        }
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    };
    const handleStatusFilterChange = (event) => {
        setStatusFilter(event.target.value);
        setCurrentPage(1);
    };

    const filteredCtvs = useMemo(() => {
        let result = ctvs;
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(ctv => {
                const ctvCode = ctv.ctv_code ? ctv.ctv_code.toLowerCase() : '';
                const ctvName = ctv.ctv_name ? ctv.ctv_name.toLowerCase() : '';
                return ctvCode.includes(searchLower) || ctvName.includes(searchLower);
            });
        }

        // Lọc theo Status
        if (statusFilter) {
            result = result.filter(ctv => ctv.status === statusFilter);
        }

        return result;
    }, [ctvs, searchTerm, statusFilter]);

    const totalPages = Math.ceil(filteredCtvs.length / ITEMS_PER_PAGE);
    const paginatedCtvs = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredCtvs.slice(startIndex, endIndex);
    }, [filteredCtvs, currentPage]);

    const renderPagination = () => {
         if (totalPages <= 1) return null;
         const pages = [];
         const maxPagesToShow = 5;
         let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
         let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
         if (endPage - startPage + 1 < maxPagesToShow) {
             startPage = Math.max(1, endPage - maxPagesToShow + 1);
         }

         const buttonClass = `px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-100 border dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600`;
         const activeButtonClass = `bg-primary text-white`;

         if (startPage > 1) {
             pages.push(<button key={1} onClick={() => setCurrentPage(1)} className={buttonClass}>1</button>);
             if (startPage > 2) {
                 pages.push(<span key="dots-start" className="px-3 py-1 dark:text-gray-400">...</span>);
             }
         }
         for (let i = startPage; i <= endPage; i++) {
             pages.push(
                 <button
                     key={i}
                     onClick={() => setCurrentPage(i)}
                     className={`px-3 py-1 rounded-md ${currentPage === i ? activeButtonClass : buttonClass}`}
                 >
                     {i}
                 </button>
             );
         }
         if (endPage < totalPages) {
             if (endPage < totalPages - 1) {
                 pages.push(<span key="dots-end" className="px-3 py-1 dark:text-gray-400">...</span>);
             }
             pages.push(<button key={totalPages} onClick={() => setCurrentPage(totalPages)} className={buttonClass}>{totalPages}</button>);
         }
         return pages;
    };

    const handlePrevPage = () => { setCurrentPage(prev => Math.max(prev - 1, 1)); };
    const handleNextPage = () => { setCurrentPage(prev => Math.min(prev + 1, totalPages)); };


    return (
        <div>
            <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    {/* Bọc search và select trong 1 div */}
                    <div className="flex items-center gap-4"> 
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={t('dl.ctv.searchPlaceholder')}
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="w-80 bg-light-gray border border-border-color rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                        </div>

                        {/* Thêm Select Dropdown */}
                        <select
                            value={statusFilter}
                            onChange={handleStatusFilterChange}
                            className="bg-light-gray border border-border-color rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="">{t('dl.balance.allStatuses') || 'Tất cả trạng thái'}</option>
                            <option value="Đang hoạt động">{t('status.active')}</option>
                            <option value="Đang chờ cấp tài khoản">{t('status.pendingApproval')}</option>
                            <option value="Ngừng hoạt động">{t('status.inactive')}</option>
                            <option value="unknown">{t('status.unknown')}</option>
                        </select>
                    </div>

                    <Link
                        to="/dl/ctv/new"
                        className="flex items-center gap-2 bg-green-500 text-white font-bold px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                    >
                       <LuPlus size={20} />
                       {t('dl.ctv.addCtv')}
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                         <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t('dl.ctv.ctvCodeHeader')}</th> 
                                <th scope="col" className="px-6 py-3">{t('dl.ctv.ctvNameHeader')}</th>
                                <th scope="col" className="px-6 py-3">{t('dl.ctv.statusHeader')}</th> 
                                <th scope="col" className="px-6 py-3">{t('dl.ctv.createdDateHeader')}</th>
                                <th scope="col" className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-4 dark:text-gray-400">{t('general.loading')}</td></tr>
                            ) : paginatedCtvs.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-4 dark:text-gray-400">{t('dl.ctv.notFound')}</td></tr> // Dịch (cần thêm key mới)
                            ) : (
                                paginatedCtvs.map((ctv) => (
                                    <tr key={ctv.ctv_id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{ctv.ctv_code || 'N/A'}</td>
                                        <td className="px-6 py-4 dark:text-gray-300">{ctv.ctv_name || 'N/A'}</td>
                                        <td className="px-6 py-4"><StatusBadge status={ctv.status} /></td>
                                        <td className="px-6 py-4 dark:text-gray-300">{new Date(ctv.created_at || ctv.ngaythamgia).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-4">
                                                <Link to={`/dl/ctv/edit/${ctv.ctv_id}`} className="text-gray-400 hover:text-green-600 dark:hover:text-green-500"> <LuPencil size={18} /> </Link>
                                                <button onClick={() => handleDeleteCtv(ctv.ctv_id)} className="text-gray-400 hover:text-red-600 dark:hover:text-red-500"> <LuTrash2 size={18} /> </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                 <div className="flex justify-between items-center mt-6">
                     <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('general.showingResults', {
                             start: paginatedCtvs.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0,
                             end: (currentPage - 1) * ITEMS_PER_PAGE + paginatedCtvs.length,
                             total: filteredCtvs.length
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

export default CTVPage;