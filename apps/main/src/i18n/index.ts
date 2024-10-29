import i18n from "i18next"
import { initReactI18next } from "react-i18next"

import common from "@/i18n/locales/en/common.json"
import liquidity from "@/i18n/locales/en/liquidity.json"
import wallet from "@/i18n/locales/en/wallet.json"

export const defaultNS = "common"
export const resources = {
  en: { common, liquidity, wallet },
} as const

i18n.use(initReactI18next).init({
  defaultNS,
  resources,
  fallbackLng: "en",
  lng: "en",
})

export default i18n
