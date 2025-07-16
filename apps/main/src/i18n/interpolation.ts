import Big from "big.js"
import {
  differenceInSeconds,
  format as formatDate,
  formatDuration,
  intervalToDuration,
  isBefore,
  isDate,
} from "date-fns"
import { FormatFunction } from "i18next"
import { isNullish } from "remeda"

import i18n from "@/i18n"

const NB_SPACE = String.fromCharCode(160) // non-breaking space
const MIN_PERCENTAGE_THRESHOLD = Big(0.01)

const formatNumberParts = (part: Intl.NumberFormatPart) => {
  if (part.type === "group") {
    return NB_SPACE
  }
  return part.value
}

const getMaxSignificantDigits = (
  value: number | bigint | string,
  options: Intl.NumberFormatOptions,
) => {
  if (options.notation === "compact") {
    return 2
  }

  const numberBig = Big(typeof value === "bigint" ? value.toString() : value)

  if (numberBig.lte(1)) {
    return 4
  }

  const intPartLen = Math.ceil(Math.log10(Number(value) + 1))

  return Math.min(
    21,
    (numberBig.gt(99999.9999) ? 0 : numberBig.gt(999.9999) ? 2 : 4) +
      intPartLen,
  )
}

const formatters = {
  number: (
    value: number | bigint | string | null | undefined,
    lng?: string,
    options: Record<string, unknown> = {},
  ) => {
    if (isNullish(value) || Number.isNaN(Number(value))) {
      return "N / A"
    }

    return new Intl.NumberFormat(lng, {
      maximumSignificantDigits:
        options.maximumSignificantDigits || options.maximumFractionDigits
          ? undefined
          : getMaxSignificantDigits(value, options),
      ...options,
    })
      .formatToParts(value)
      .map(formatNumberParts)
      .join("")
  },

  percent: (
    value: number | bigint | null | undefined,
    lng?: string,
    options: Record<string, unknown> = {},
  ) => {
    if (isNullish(value) || Number.isNaN(Number(value))) {
      return "N / A"
    }

    const percentage = Big(value.toString())
    const isBelowThreshold =
      percentage.gt(0) && percentage.lt(MIN_PERCENTAGE_THRESHOLD)

    const percentageAdjusted = isBelowThreshold
      ? MIN_PERCENTAGE_THRESHOLD.div(100)
      : percentage.div(100)

    const formattedValue = Intl.NumberFormat(lng, {
      style: "percent",
      maximumFractionDigits: 2,
      ...options,
    })
      .formatToParts(percentageAdjusted.toNumber())
      .map(formatNumberParts)
      .join("")

    const prefix = isBelowThreshold ? "<" : ""

    return `${prefix}${formattedValue}`
  },

  currency: (
    value: number | bigint | string | null | undefined,
    lng?: string,
    options: Record<string, unknown> = {},
  ) => {
    if (isNullish(value) || Number.isNaN(Number(value))) {
      return "N / A"
    }

    let parts = Intl.NumberFormat(lng, {
      style: "currency",
      currency: "USD",
      maximumSignificantDigits:
        options.maximumSignificantDigits || options.maximumFractionDigits
          ? undefined
          : getMaxSignificantDigits(value, options),
      ...options,
    }).formatToParts(value)

    if (options.symbol) {
      parts = [
        ...parts.filter(({ type }) => type !== "currency"),
        { type: "literal", value: NB_SPACE },
        { type: "currency", value: options.symbol } as Intl.NumberFormatPart,
      ]
    }

    return parts.map(formatNumberParts).join("")
  },

  date: (value: Date | number, options: Record<string, string>) => {
    const date = new Date(value)
    if (!isDate(date)) {
      return ""
    }

    try {
      return formatDate(date, options.format ?? "yyyy-MM-dd")
    } catch (error) {
      console.error(error)
    }

    return ""
  },

  relativeTime: (date: Date, targetDate: Date) => {
    const isPast = isBefore(date, targetDate)
    const duration = intervalToDuration({
      start: isPast ? date : targetDate,
      end: isPast ? targetDate : date,
    })

    const diffInSec = Math.abs(differenceInSeconds(date, targetDate))

    if (diffInSec < 1) {
      return i18n.t("date.relative.now")
    }

    const formatted = formatDuration(duration, {
      format:
        diffInSec < 60
          ? ["seconds"]
          : ["years", "months", "days", "hours", "minutes"],
    })

    return isPast
      ? i18n.t("date.relative.past", { value: formatted })
      : i18n.t("date.relative.future", { value: formatted })
  },
}

function parseFormatStr(formatStr: string | undefined) {
  let formatName = formatStr
  const formatOptions: Record<string, unknown> = {}

  if (formatStr != null && formatStr.indexOf("(") > -1) {
    const [name, args] = formatStr.split("(")
    formatName = name

    const optList = args!
      .substring(0, args!.length - 1)
      .split(";")
      .filter((x) => !!x)

    for (const item of optList) {
      const [key, ...rest] = item.split(":")
      formatOptions[key!.trim()] = rest
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

export const interpolationFormat: FormatFunction = (
  value,
  format,
  lng,
  tOptions,
) => {
  const { formatName, formatOptions } = parseFormatStr(format)
  const options = { ...formatOptions, ...tOptions }

  switch (formatName) {
    case "number":
      return formatters.number(value, lng, options)

    case "percent":
      return formatters.percent(value, lng, options)

    case "currency":
      return formatters.currency(value, lng, options)

    case "date":
      return formatters.date(value, options)

    case "relative":
      return formatters.relativeTime(value, options.targetDate ?? new Date())

    default:
      return value ?? null
  }
}
