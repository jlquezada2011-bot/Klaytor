import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'fil' | 'ceb';

interface Translations {
  [key: string]: {
    en: string;
    fil: string;
    ceb: string;
  };
}

const dictionary: Translations = {
  appName: {
    en: 'Klaytor Health',
    fil: 'Klaytor Kalusugan',
    ceb: 'Klaytor Panglawas',
  },
  emergencyWarning: {
    en: 'EMERGENCY: If you are experiencing a medical emergency, call 911 or visit the nearest emergency room immediately.',
    fil: 'EMERHENSIYA: Kung ikaw ay nakakaranas ng medikal na emerhensiya, tumawag sa 911 o pumunta sa pinakamalapit na ospital agad.',
    ceb: 'EMERHENSIYA: Kung ikaw nakasinati og medikal nga emerhensiya, tawag sa 911 o adto dayon sa pinakaduol nga ospital.',
  },
  medicalDisclaimer: {
    en: 'Klaytor is a digital health platform and not a substitute for professional medical diagnosis or emergency care.',
    fil: 'Ang Klaytor ay platapormang pangkalusugan at hindi kapalit ng propesyonal na medikal na pagsusuri o emerhensiya.',
    ceb: 'Ang Klaytor kay plataporma sa panglawas ug dili kapuli sa propesyonal nga pagdayagnos o serbisyong pang-emerhensiya.',
  },
  dashboard: {
    en: 'Dashboard',
    fil: 'Dashboard',
    ceb: 'Dashboard',
  },
  appointments: {
    en: 'Appointments',
    fil: 'Mga Iskedyul',
    ceb: 'Mga Iskedyul',
  },
  healthRecords: {
    en: 'Health Records',
    fil: 'Medikal na Rekord',
    ceb: 'Rekord sa Panglawas',
  },
  healthMonitoring: {
    en: 'Health Monitoring',
    fil: 'Pagsubaybay sa Kalusugan',
    ceb: 'Pagbantay sa Panglawas',
  },
  healthEducation: {
    en: 'Health Education',
    fil: 'Edukasyong Pangkalusugan',
    ceb: 'Edukasyon sa Panglawas',
  },
  messages: {
    en: 'Messages',
    fil: 'Mga Mensahe',
    ceb: 'Mga Mensahe',
  },
  privacyConsent: {
    en: 'Privacy & Consent',
    fil: 'Pribasiya at Pahintulot',
    ceb: 'Pribasiya ug Pagtugot',
  },
  adminCenter: {
    en: 'System Admin',
    fil: 'Admin ng Sistema',
    ceb: 'Admin sa Sistema',
  },
  aiAssistant: {
    en: 'Klaytor AI Guide',
    fil: 'Gabay ng Klaytor AI',
    ceb: 'Giya sa Klaytor AI',
  },
  bookAppointment: {
    en: 'Book Appointment',
    fil: 'Magpa-iskedyul ng Konsulta',
    ceb: 'Magpa-iskedyul og Konsulta',
  },
  recordVitals: {
    en: 'Record Vitals',
    fil: 'Itala ang Vitals',
    ceb: 'Irekord ang Vitals',
  },
  login: {
    en: 'Log In',
    fil: 'Mag-login',
    ceb: 'Sulod',
  },
  logout: {
    en: 'Log Out',
    fil: 'Mag-logout',
    ceb: 'Gawas',
  },
  register: {
    en: 'Create Account',
    fil: 'Gumawa ng Account',
    ceb: 'Paghimo og Account',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('klaytor_lang') as Language;
    if (saved && (saved === 'en' || saved === 'fil' || saved === 'ceb')) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('klaytor_lang', lang);
  };

  const t = (key: string): string => {
    if (dictionary[key] && dictionary[key][language]) {
      return dictionary[key][language];
    }
    return dictionary[key]?.en || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
