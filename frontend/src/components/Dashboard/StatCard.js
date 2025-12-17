const StatCard = ({ title, value, change, changeType, children, bgColorClass }) => {
    const isPositive = changeType === 'positive';

    // Xác định màu chữ và màu badge dựa trên việc có bgColorClass hay không
    const hasBg = !!bgColorClass;
    const titleColor = hasBg ? 'text-white opacity-80' : 'text-gray-500 dark:text-gray-400';
    const valueColor = hasBg ? 'text-white' : 'text-gray-800 dark:text-white';
    const changeBadgeColor = hasBg 
        ? 'bg-white/30 text-white' 
        : (isPositive 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200');

    return (
        <div className={`p-6 rounded-lg shadow-md ${bgColorClass || 'bg-white dark:bg-gray-800 dark:border dark:border-gray-700'}`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className={`text-sm font-medium ${titleColor}`}>{title}</p>
                    <p className={`text-3xl font-bold mt-1 ${valueColor}`}>{value}</p>
                    {change && (
                        <div className={`mt-2 text-xs font-semibold px-2 py-1 rounded-full inline-flex items-center ${changeBadgeColor}`}>
                            {isPositive ? '▲' : '▼'} {change}
                        </div>
                    )}
                </div>
                <div className="w-24 h-12 -mt-2 -mr-2">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default StatCard;