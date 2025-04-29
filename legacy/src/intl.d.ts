import "react-i18next"
import type { BalanceFormatOptions } from "utils/formatting"
import translations from "./i18n/locales/en/translations.json"

declare module "react-i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation"
    resources: {
      translation: typeof translations
    }
  }
}

declare module "i18next" {
  interface TOptionsBalance extends BalanceFormatOptions {
    formatParams?: Record<string, BalanceFormatOptions>
  }

  export interface TOptionsBase extends TOptionsBalance {}
}
