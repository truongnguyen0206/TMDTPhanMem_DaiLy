import React, { useEffect } from 'react';
import StatCard from '../../components/Dashboard/StatCard'; // Import StatCard đã cập nhật
import { useOutletContext } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { LuArrowUpRight, LuArrowDownRight, LuDownload } from 'react-icons/lu';
import { useTranslation } from 'react-i18next'; // Import useTranslation

// Dữ liệu giả lập (giữ nguyên)
const lineChartData = [
  { name: '2015', "dataKey1": 32, "dataKey2": 40 }, // Sử dụng key trung gian
  { name: '2016', "dataKey1": 35, "dataKey2": 28 },
  { name: '2017', "dataKey1": 48, "dataKey2": 38 },
  { name: '2018', "dataKey1": 35, "dataKey2": 50 },
  { name: '2019', "dataKey1": 45, "dataKey2": 30 },
  { name: '2020', "dataKey1": 55, "dataKey2": 42 },
];
const barChartData = [
  { name: '01', value: 50 }, { name: '02', value: 25 }, { name: '03', value: 60 },
  { name: '04', value: 30 }, { name: '05', value: 70 },
];
const areaChartData = [
    { name: '2015', value: 200000 }, { name: '2016', value: 300000 },
    { name: '2017', value: 600000 }, { name: '2018', value: 750000 },
    { name: '2019', value: 500000 }, { name: '2020', value: 650000 },
];

const DashboardPage = () => {
    const { setPageTitle } = useOutletContext();
    // Lấy cả t và i18n từ hook
    const { t, i18n } = useTranslation();

    useEffect(() => {
        // Dịch tiêu đề trang sử dụng key từ sidebar
        setPageTitle(t('sidebar.dashboard'));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setPageTitle, t, i18n.language]); // Bây giờ i18n đã được định nghĩa

    return (
        <div className="space-y-6">
            {/* Hàng trên: Các thẻ thông số */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Dịch title bằng key trong file json */}
                <StatCard title={t('sidebar.ctv')} value="50"> {/* Sửa key dịch cho CTV */}
                     <ResponsiveContainer width="100%" height="100%">
                         <LineChart data={[{uv: 10}, {uv: 25}, {uv: 15}, {uv: 40}, {uv: 30}, {uv: 50}]}>
                            <Line type="monotone" dataKey="uv" stroke="#3B82F6" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </StatCard>
                 {/* Dịch title bằng key trong file json */}
                <StatCard title={t('sidebar.orders')} value="1,565k">
                    <ResponsiveContainer width="100%" height="100%">
                         <LineChart data={[{uv: 30}, {uv: 20}, {uv: 50}, {uv: 40}, {uv: 60}, {uv: 55}]}>
                            <Line type="monotone" dataKey="uv" stroke="#3B82F6" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </StatCard>
                 {/* Dịch title bằng key trong file json */}
                <StatCard title={t('npp.dashboard.revenueToday')} value="3,245,000đ" change="+5%" changeType="positive" bgColorClass="bg-blue-600 text-white">
                    <div className="flex items-center justify-center h-full">
                        <LuArrowUpRight size={32} className="opacity-50" />
                    </div>
                </StatCard>
                 {/* Dịch title bằng key trong file json */}
                <StatCard title={t('npp.dashboard.revenueYesterday')} value="3,953,000đ" change="+5%" changeType="positive" bgColorClass="bg-green-500 text-white">
                     <div className="flex items-center justify-center h-full">
                        <LuArrowDownRight size={32} className="opacity-50" />
                    </div>
                </StatCard>
            </div>

            {/* Biểu đồ đường */}
            <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
                 {/* Dịch tiêu đề chart bằng key trong file json */}
                <h3 className="font-bold text-lg mb-4 dark:text-white">{t('npp.dashboard.ordersByYear')}</h3>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <LineChart data={lineChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#4B5563" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} itemStyle={{ color: '#E5E7EB' }}/>
                            <Legend wrapperStyle={{ color: '#9CA3AF' }}/>
                            {/* Dịch tên đường bằng key trong file json */}
                            <Line type="monotone" dataKey="dataKey1" name={t('npp.dashboard.dataKey1')} stroke="#8884d8" strokeWidth={3} activeDot={{ r: 8 }} />
                            {/* Dịch tên đường bằng key trong file json */}
                            <Line type="monotone" dataKey="dataKey2" name={t('npp.dashboard.dataKey2')} stroke="#F87171" strokeWidth={3} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Hàng dưới: Biểu đồ cột và miền */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
                    {/* Dịch bằng key trong file json */}
                    <h3 className="font-bold text-lg dark:text-white">{t('npp.dashboard.yourBalance')}</h3>
                    <p className="text-3xl font-bold mt-2 dark:text-white">5,244,000đ</p>
                    {/* Dịch và truyền biến bằng key trong file json */}
                    <p className="text-sm text-green-500">{t('npp.dashboard.balanceChange', { percent: '2.7' })}</p>
                    <div style={{ width: '100%', height: 150, marginTop: '1rem' }}>
                         <ResponsiveContainer>
                            <BarChart data={barChartData}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                                <Bar dataKey="value" fill="#34D399" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                         {/* Dịch bằng key trong file json */}
                        <h3 className="font-bold text-lg dark:text-white">{t('npp.dashboard.revenueByYear')}</h3>
                        <button className="flex items-center gap-2 bg-blue-100 text-blue-600 font-semibold px-4 py-2 rounded-lg hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800">
                           <LuDownload size={16} />
                            {/* Dịch bằng key trong file json */}
                           {t('npp.dashboard.downloadCSV')}
                        </button>
                    </div>
                     <div style={{ width: '100%', height: 250 }}>
                         <ResponsiveContainer>
                            <AreaChart data={areaChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#4B5563" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }}/>
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }}/>
                                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} itemStyle={{ color: '#E5E7EB' }}/>
                                <Area type="monotone" dataKey="value" stroke="#4F46E5" fill="#C7D2FE" fillOpacity={0.3} strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;