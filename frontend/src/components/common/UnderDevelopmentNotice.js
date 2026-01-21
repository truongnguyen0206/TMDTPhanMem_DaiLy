import React from 'react';

import underDevelopmentImg from '../../assets/images/hinhxaydung.avif';

const UnderDevelopmentNotice = ({ label = 'Chức năng đang được phát triển' }) => {
  return (
    <div className="w-full">
      <div className="mx-auto max-w-3xl">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-10 flex flex-col items-center justify-center gap-6 dark:bg-gray-800 dark:border-gray-700">
          <img
            src={underDevelopmentImg}
            alt={label}
            className="w-full max-w-md select-none"
            draggable="false"
          />
          <p className="text-base sm:text-lg font-semibold text-gray-700 text-center dark:text-gray-200">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnderDevelopmentNotice;
