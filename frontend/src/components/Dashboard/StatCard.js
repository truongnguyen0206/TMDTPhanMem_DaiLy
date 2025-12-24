import React from 'react';

const StatCard = ({
    title,
    value,
    change,
    changeType,
    children,
    bgColorClass,
}) => {
    const isPositive = changeType === 'positive';
    const hasBg = Boolean(bgColorClass);

    // ===== COLOR LOGIC (giữ nguyên hành vi cũ) =====
    const titleColor = hasBg
        ? 'text-white/80'
        : 'text-gray-500 dark:text-gray-400';

    const valueColor = hasBg
        ? 'text-white'
        : 'text-gray-900 dark:text-gray-100';

    const changeBadgeColor = hasBg
        ? 'bg-white/30 text-white'
        : isPositive
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';

    // ===== FIX DARK MODE NỀN =====
    const baseBgClass = hasBg
        ? bgColorClass
        : 'bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full';

    return (
        <div
            className={`
                h-full
                p-6
                rounded-xl
                ${baseBgClass}
                shadow-sm
                transition-colors
            `}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className={`text-sm font-medium ${titleColor}`}>
                        {title}
                    </p>

                    <p className={`mt-1 text-3xl font-bold ${valueColor}`}>
                        {value}
                    </p>

                    {change && (
                        <div
                            className={`
                                mt-2
                                inline-flex items-center
                                rounded-full
                                px-2 py-1
                                text-xs font-semibold
                                ${changeBadgeColor}
                            `}
                        >
                            {isPositive ? '▲' : '▼'} {change}
                        </div>
                    )}
                </div>

                {/* ICON / CHILDREN */}
                <div className="w-24 h-12 -mt-2 -mr-2 flex items-start justify-end">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default StatCard;
