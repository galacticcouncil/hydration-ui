import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import translationEN from "./locales/en/translations.json"
import { formatDate, formatNum } from "utils/formatting"
import BN from "bignumber.js"
import { getFullDisplayBalance } from "../utils/balance"
import BigNumber from "bignumber.js"
import { BN_10 } from "utils/constants"

function isBalanceWithSettings(value: any): value is {
  value: BigNumber
  decimals?: string | number
  displayDecimals?: string | number
} {
  return value !== null && "value" in value
}

function isRecord<Key extends string, Value>(
  x: unknown,
): x is Record<Key, Value> {
  return typeof x === "string"
}

function getFormatParams<T>(
  typeParams: (value: unknown) => T | null,
  options: Record<string, unknown> | undefined,
) {
  if (options == null) return null
  if (
    typeof options.interpolationkey === "string" &&
    isRecord<string, unknown>(options.formatParams)
  ) {
    return typeParams(options.formatParams[options.interpolationkey])
  }

  return null
}

function getBigNumberParams(
  x: unknown,
): null | { precision: BigNumber | number } {
  if (!isRecord(x) || !("precision" in x)) return null

  if (
    BigNumber.isBigNumber(x["precision"]) ||
    typeof x["precision"] === "number"
  ) {
    return { precision: x["precision"] }
  }

  return null
}

function convertBigNumberToString(
  value: BN | BigNumber | number | null | undefined,
  options: Record<string, unknown> | undefined,
) {
  if (value == null) return null
  if (typeof value === "number") return value.toString()
  let bn: BigNumber = BN.isBigNumber(value)
    ? new BigNumber(value.toString())
    : value

  const params = getFormatParams(getBigNumberParams, options)
  if (params != null) {
    bn = bn.div(BN_10.pow(params.precision))
  }
  return bn.toFixed()
}

const resources = {
  en: { translation: translationEN },
}

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    fallbackLng: "en",
    lng: "en",
    interpolation: {
      format(value, format, lng, options) {
        if (format === "balance") {
          if (!value) {
            return "-"
          }

          if (isBalanceWithSettings(value)) {
            return getFullDisplayBalance(
              value.value,
              value.decimals,
              value.displayDecimals,
            )
          }

          return getFullDisplayBalance(value)
        }

        if (format === "num") {
          const parsed = convertBigNumberToString(value, options)
          if (parsed == null) return null
          return formatNum(parsed, undefined, lng)
        }

        if (format === "compact") {
          const parsed = convertBigNumberToString(value, options)
          if (parsed == null) return null
          return formatNum(parsed, { notation: "compact" }, lng)?.toLowerCase()
        }

        if (format === "usd") {
          const n = BN.isBigNumber(value) ? value.toNumber() : value
          return formatNum(n, {
            style: "currency",
            currency: "USD",
          })
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
