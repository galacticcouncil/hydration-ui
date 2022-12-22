import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import {
  BigNumberFormatOptionsSchema,
  formatBigNumber,
  formatDate,
  formatNum,
  formatRelativeTime,
  getFormatSeparators,
} from "utils/formatting"
import { normalizeBigNumber } from "../utils/balance"
import { resources } from "./locales"
import { isRecord } from "utils/helpers"

/**
 * BigNumber.js formatting via i18n
 */
function getBigNumberFormatParams(
  options: Record<string, unknown> | undefined,
) {
  if (options == null) return null

  let parsed = BigNumberFormatOptionsSchema.safeParse(options)
  if (parsed.success) return parsed.data

  if (
    typeof options.interpolationkey === "string" &&
    isRecord(options.formatParams)
  ) {
    parsed = BigNumberFormatOptionsSchema.safeParse(
      options.formatParams[options.interpolationkey],
    )
    if (parsed.success) return parsed.data
  }

  return null
}

function parseFormatStr(formatStr: string | undefined) {
  let formatName = formatStr
  const formatOptions: Record<string, unknown> = {}

  if (formatStr != null && formatStr.indexOf("(") > -1) {
    const [name, args] = formatStr.split("(")
    formatName = name

    const optList = args
      .substring(0, args.length - 1)
      .split(";")
      .filter((x) => !!x)

    for (const item of optList) {
      const [key, ...rest] = item.split(":")
      formatOptions[key.trim()] = rest
        .join(":")
        .trim()
        .replace(/^'+|'+$/g, "")
    }
  }

  return {
    formatName: formatName?.toLowerCase().trim(),
    formatOptions,
  }
}

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    fallbackLng: "en",
    lng: "en",
    interpolation: {
      format(value, format, lng, tOptions) {
        const { formatName, formatOptions } = parseFormatStr(format)
        const options = { ...formatOptions, ...tOptions }

        if (formatName === "bignumber") {
          return formatBigNumber(value, getBigNumberFormatParams(options), lng)
        }

        if (formatName === "relativetime") {
          return formatRelativeTime(
            value,
            options.targetDate ?? new Date(),
            lng,
          )
        }

        // Not ideal, but we don't have a way to format BigNumber to a compact form
        if (formatName === "compact") {
          const num = normalizeBigNumber(value)
          if (num == null) return null
          return formatNum(
            num.toFixed(),
            { notation: "compact" },
            lng,
          )?.replaceAll(
            getFormatSeparators(lng).group ?? ",",
            String.fromCharCode(160),
          )
        }

        if (value instanceof Date) {
          return formatDate(value, format || "")
        }

        return value ?? null
      },
      escapeValue: false, // react already safes from xss
    },
  })

if (import.meta.hot) {
  import.meta.hot.accept(["./locales"], ([module]) => {
    for (const lang in module?.resources) {
      for (const ns in module?.resources[lang]) {
        i18n.addResourceBundle(lang, ns, module?.resources[lang][ns])
      }
    }

    i18n.changeLanguage(i18n.language)
  })
}

export default i18n
