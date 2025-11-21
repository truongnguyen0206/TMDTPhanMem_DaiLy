// Tệp mới: src/i18n.js

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import các tệp JSON chứa bản dịch (sẽ tạo ở bước sau)
import translationEN from './locales/en/translation.json';
import translationVI from './locales/vi/translation.json';

const resources = {
  en: {
    translation: translationEN
  },
  vi: {
    translation: translationVI
  }
};

i18n
  .use(LanguageDetector) // Tự động phát hiện ngôn ngữ trình duyệt
  .use(initReactI18next) // Kết nối i18next với react
  .init({
    resources,
    fallbackLng: 'vi', // Ngôn ngữ mặc định nếu không phát hiện được
    debug: process.env.NODE_ENV === 'development', // Bật debug mode khi đang phát triển
    interpolation: {
      escapeValue: false, // React đã tự bảo vệ khỏi XSS
    },
    detection: {
      // thứ tự ưu tiên phát hiện ngôn ngữ
      order: ['localStorage', 'navigator', 'htmlTag'],
      // key để lưu trong localStorage
      lookupLocalStorage: 'appLanguage',
      // cache vào localStorage
      caches: ['localStorage'],
    }
  });

export default i18n;