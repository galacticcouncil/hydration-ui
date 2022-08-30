import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import translationEN from "./locales/en/translations.json"
import { formatDate, formatNum } from "utils/formatting"
import BN from "bignumber.js"

function isBNPrecision(value: any): value is { value: BN; precision?: number } {
  return value != null && "value" in value && BN.isBigNumber(value.value)
}

const resources = {
  en: {
    translation: translationEN,
  },
}

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    fallbackLng: "en",
    lng: "en",
    interpolation: {
      format(value, format, lng) {
        if (format === "amount") {
          if (isBNPrecision(value)) {
            const precision = new BN(10).pow(new BN(value.precision ?? 12))
            return value.value.div(precision).toString()
          }

          if (BN.isBigNumber(value)) {
            return value.toString()
          }

          return null
        }

        if (format === "num") {
          return formatNum(value, undefined, lng)
        }

        if (format === "compact") {
          return formatNum(value, { notation: "compact" }, lng)?.toLowerCase()
        }

        if (value instanceof Date) {
          return formatDate(value, format || "")
        }

        return value
      },
      escapeValue: false, // react already safes from xss
    },
  })

export default i18n
