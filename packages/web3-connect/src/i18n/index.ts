import { interpolationFormat } from "@galacticcouncil/utils"
import i18next, { type i18n as I18nInstance } from "i18next"
import { initReactI18next } from "react-i18next"

import translations from "@/i18n/locales/en/translations.json"

export const defaultNS = "translations"
export const resources = {
  en: { translations },
} as const

const i18n: I18nInstance = i18next.createInstance()

i18n.use(initReactI18next).init({
  defaultNS,
  resources,
  fallbackLng: "en",
  lng: "en",
  interpolation: {
    format: interpolationFormat,
    escapeValue: false,
  },
})

export default i18n
