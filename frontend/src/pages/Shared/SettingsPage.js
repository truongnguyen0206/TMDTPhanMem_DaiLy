// Cập nhật tệp: src/pages/Shared/SettingsPage.js (Tệp tôi đã tạo cho bạn ở lần trước)

import { useEffect } from 'react'; // Bỏ useState nếu không dùng cho Language
import { useOutletContext } from 'react-router-dom';
import { LuSun, LuMoon, LuLanguages, LuRotateCcw, LuPalette } from 'react-icons/lu';
import { useTheme } from '../../context/ThemeContext'; // <-- 1. Import useTheme
import { useTranslation } from 'react-i18next';

// Component con cho mỗi mục cài đặt
const SettingsSection = ({ title, icon, children }) => (
    // Thêm style dark mode cho component cha
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
            <span className="">{icon}</span> 
            {/* Thêm style dark mode cho tiêu đề */}
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{title}</h2>
        </div>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);


const SettingsPage = () => {
    const { setPageTitle } = useOutletContext();
    const { theme, setTheme } = useTheme(); // <-- 2. Lấy state từ context
    const { t, i18n } = useTranslation();

    // State cho ngôn ngữ giờ sẽ lấy từ i18n
    const currentLanguage = i18n.language;

    useEffect(() => {
        // Dịch tiêu đề trang
        setPageTitle(t('settings.title'));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setPageTitle, t, i18n.language]); // Thêm i18n.language để cập nhật tiêu đề khi đổi ngôn ngữ

    // Hàm đổi ngôn ngữ
    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const handleRestoreDefaults = () => {
        setTheme('light');
        changeLanguage('vi'); 
        alert(t('settings.restoreSuccess')); // Dịch thông báo
    };
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            
           <SettingsSection
                title={t('settings.interface')} // Dịch title
                icon={<LuPalette size={22} className="text-indigo-500" />}
            >
                {/* Thêm style dark mode cho text */}
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.interfaceDesc')}</p> {/* Dịch mô tả */}
                <div className="flex gap-4">
                    {/* Nút Sáng */}
                    <button onClick={() => setTheme('light')} // <-- 4. Cập nhật onClick
                        className={`flex-1 p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                            theme === 'light' 
                            ? 'border-primary bg-blue-50' 
                            // Thêm style dark mode cho nút khi không active
                            : 'border-gray-200 bg-white hover:border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:hover:border-gray-500'
                        }`}
                    >
                        <LuSun size={20} className={theme === 'light' ? 'text-text-primary' : 'text-gray-500 dark:text-gray-400'} />
                        <span className={`font-semibold ${theme === 'light' ? 'text-text-primary' : 'text-gray-700 dark:text-gray-300'}`}>
                            {t('settings.light')} {/* Dịch text */}
                        </span>
                    </button>
                    
                    {/* Nút Tối */}
                    <button
                        onClick={() => setTheme('dark')} // <-- 5. Cập nhật onClick
                        className={`flex-1 p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                            theme === 'dark' 
                            ? 'border-primary bg-blue-50' 
                            // Thêm style dark mode cho nút khi không active
                            : 'border-gray-200 bg-white hover:border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:hover:border-gray-500'
                        }`}
                    >
                        <LuMoon size={20} className={theme === 'dark' ? 'text-text-primary' : 'text-gray-500 dark:text-gray-400'} />
                        <span className={`font-semibold ${theme === 'dark' ? 'text-text-primary' : 'text-gray-700 dark:text-gray-300'}`}>
                             {t('settings.dark')} {/* Dịch text */}
                        </span>
                    </button>
                </div>
            </SettingsSection>

            {/* Cập nhật style dark mode cho các section còn lại */}
            <SettingsSection
                title={t('settings.language')} // Dịch title
                icon={<LuLanguages size={22} className="text-green-500" />}
            >
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.languageDesc')}</p> {/* Dịch mô tả */}
                <div>
                    <select
                        value={currentLanguage} // <-- 3. Sử dụng state từ i18n
                        onChange={(e) => changeLanguage(e.target.value)} // <-- 4. Gọi hàm đổi ngôn ngữ
                        className="w-full max-w-xs bg-gray-50 border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                        <option value="vi">{t('settings.vietnamese')}</option> {/* Dịch option */}
                        <option value="en">{t('settings.english')}</option> {/* Dịch option */}
                    </select>
                </div>
            </SettingsSection>

            {/* === 3. Khôi phục mặc định === */}
            <SettingsSection
                title={t('settings.restore')} // Dịch title
                icon={<LuRotateCcw size={22} className="text-red-500" />}
            >
                <p className="text-sm text-gray-600 dark:text-gray-400">
                   {t('settings.restoreDesc')} {/* Dịch mô tả */}
                </p>
                <div>
                    <button
                        onClick={handleRestoreDefaults}
                        className="bg-red-100 text-red-700 font-bold py-2 px-4 rounded-lg hover:bg-red-200 transition-colors dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
                    >
                        {t('settings.restoreButton')}
                    </button>
                </div>
            </SettingsSection>

        </div>
    );
};

export default SettingsPage;