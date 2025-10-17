import i18n from "i18next"
import { initReactI18next } from "react-i18next"

import { interpolationFormat } from "@/i18n/interpolation"
import borrow from "@/i18n/locales/en/borrow.json"
import common from "@/i18n/locales/en/common.json"
import liquidity from "@/i18n/locales/en/liquidity.json"
import staking from "@/i18n/locales/en/staking.json"
import trade from "@/i18n/locales/en/trade.json"
import wallet from "@/i18n/locales/en/wallet.json"

export const defaultNS = "common"
export const resources = {
  en: { common, liquidity, trade, wallet, borrow, staking },
} as const

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
