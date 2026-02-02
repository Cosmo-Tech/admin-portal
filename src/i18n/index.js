// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { initReactI18next } from 'react-i18next';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enCommon from './locales/en/common.json';
import frCommon from './locales/fr/common.json';

const resources = {
  en: {
    common: enCommon,
  },
  fr: {
    common: frCommon,
  },
};

const normalizeLanguage = (lng) => {
  // Convert language codes like 'en-US' to 'en'
  return lng.split('-')[0];
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNS: 'common',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    load: 'languageOnly', // This will load 'en' instead of 'en-US'
    nonExplicitSupportedLngs: true,
    supportedLngs: ['en', 'fr'],
  });

// Set initial language
const detectedLng = i18n.language;
i18n.changeLanguage(normalizeLanguage(detectedLng));

export default i18n;
