import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import hi from "./locales/hi.json";

export const SUPPORTED_LANGUAGES = ["en", "hi"] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export function setAppLanguage(lang: AppLanguage) {
  void i18n.changeLanguage(lang);
  if (typeof window !== "undefined") {
    document.documentElement.lang = lang;
  }
}

export default i18n;
