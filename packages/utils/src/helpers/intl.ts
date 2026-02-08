import Big, { BigSource } from "big.js"
import {
  differenceInSeconds,
  format as formatDateFns,
  formatDuration,
  intervalToDuration,
  isBefore,
  toDate,
} from "date-fns"
import {
  HumanizeDuration,
  HumanizeDurationLanguage,
} from "humanize-duration-ts"
import { isDate, isNumber, isString } from "remeda"

import { isValidBigSource } from "./big"

export type FormatValue =
  | number
  | bigint
  | string
  | Big
  | Date
  | null
  | undefined

const DEFAULT_LOCALE = "en-US"
const NB_SPACE = String.fromCharCode(160) // non-breaking space
const NA_VALUE = "N/A"
const MIN_PERCENTAGE_THRESHOLD = Big(0.01)

const formatNumberParts = (part: Intl.NumberFormatPart) => {
  if (part.type === "group") {
    return NB_SPACE
  }
  return part.value
}

const bigSourceToNumber = (value: BigSource): number => {
  if (value instanceof Big) {
    return value.toNumber()
  }
  return isNumber(value) ? value : Number(value)
}

const isValidDateValue = (
  value: FormatValue,
): value is Date | string | number => {
  return isDate(value) || isString(value) || isNumber(value)
}

const formatFractionDigits = (
  value: number | bigint,
  maximumFractionDigits: number,
  parts: Intl.NumberFormatPart[],
  decimalSeparator: string,
) => {
  const minValue = Math.pow(10, -maximumFractionDigits)

  if (value < minValue) {
    const newParts = parts.filter(({ type }) => type !== "fraction")

    newParts.unshift({
      type: "literal",
      value: "<",
    })

    if (!newParts.some(({ type }) => type === "decimal")) {
      newParts.push({
        type: "decimal",
        value: decimalSeparator,
      })
    }

    newParts.push({
      type: "fraction",
      value: minValue.toString().split(".")[1],
    })

    return newParts.map(formatNumberParts).join("")
  }

  return parts.map(formatNumberParts).join("")
}

export const getMaxSignificantDigits = (
  value: number | bigint | string | Big,
  options: Intl.NumberFormatOptions,
) => {
  if (options.notation === "compact") {
    return 2
  }

  const numberBig =
    value instanceof Big
      ? value
      : Big(typeof value === "bigint" ? value.toString() : value)

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

export const formatNumber = (
  value: FormatValue,
  lng = DEFAULT_LOCALE,
  options: Record<string, unknown> = {},
) => {
  if (!isValidBigSource(value)) {
    return NA_VALUE
  }

  const numericValue = bigSourceToNumber(value)

  return new Intl.NumberFormat(lng, {
    maximumSignificantDigits:
      options.maximumSignificantDigits || options.maximumFractionDigits
        ? undefined
        : getMaxSignificantDigits(value, options),
    ...options,
  })
    .formatToParts(numericValue)
    .map(formatNumberParts)
    .join("")
}

export const formatPercent = (
  value: FormatValue,
  lng = DEFAULT_LOCALE,
  options: Record<string, unknown> = {},
) => {
  if (!isValidBigSource(value)) {
    return NA_VALUE
  }

  const percentage = Big(value)
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
}

export const formatCurrency = (
  value: FormatValue,
  lng = DEFAULT_LOCALE,
  options: Record<string, unknown> = {},
) => {
  if (!isValidBigSource(value)) {
    return NA_VALUE
  }

  const numericValue = bigSourceToNumber(value)

  const maxFractionDigits =
    options.symbol || options.maximumFractionDigits === null
      ? options.maximumFractionDigits
      : (options.maximumFractionDigits ?? MAX_USD_FRACTION_DIGITS)

  let parts = Intl.NumberFormat(lng, {
    style: "currency",
    currency: "USD",
    maximumSignificantDigits:
      options.maximumSignificantDigits || maxFractionDigits
        ? undefined
        : getMaxSignificantDigits(value, options),
    ...options,
  }).formatToParts(numericValue)

  if (options.symbol) {
    parts = [
      ...parts.filter(({ type }) => type !== "currency"),
      { type: "literal", value: NB_SPACE },
      { type: "currency", value: options.symbol } as Intl.NumberFormatPart,
    ]
  }

  if (maxFractionDigits && numericValue > 0) {
    return formatFractionDigits(
      numericValue,
      Number(maxFractionDigits),
      parts,
      getDecimalSeparator(lng),
    )
  }

  return parts.map(formatNumberParts).join("")
}

const FORMAT_ASSET_AMOUNT_REGEXP =
  /^(?<integer>[^.,]*)(?<separator>[.,])(?<decimals>.*)$/

export const getDecimalSeparator = (lng: string): string => {
  const parts = new Intl.NumberFormat(lng).formatToParts(1.1)
  const decimalPart = parts.find(({ type }) => type === "decimal")
  return decimalPart?.value || "."
}

export const formatAssetAmount = (
  amount: string,
  maxDecimals: number,
): string => {
  if (!amount || !maxDecimals) {
    return amount
  }

  const match = amount.match(FORMAT_ASSET_AMOUNT_REGEXP)

  if (!match || !match.groups) {
    return amount
  }

  const { integer, separator, decimals } = match.groups

  const validDecimals = decimals.slice(0, maxDecimals)
  const trimmedDecimals = validDecimals.replace(/0+$/, "")

  return trimmedDecimals ? `${integer}${separator}${trimmedDecimals}` : integer
}

export const MAX_USD_FRACTION_DIGITS = 2

const langService = new HumanizeDurationLanguage()
langService.addLanguage("shortEn", {
  y: () => "y",
  mo: () => "mo",
  w: () => "w",
  d: () => "d",
  h: () => "h",
  m: () => "m",
  s: () => "s",
  ms: () => "ms",
  decimal: "2",
})

const humanizer = new HumanizeDuration(langService)

export const formatDate = (
  value: FormatValue,
  options: Record<string, unknown> = {},
) => {
  if (!isValidDateValue(value)) return ""
  const date = toDate(value)

  try {
    const fmt =
      typeof options.format === "string" ? options.format : "yyyy-MM-dd"
    return formatDateFns(date, fmt)
  } catch (error) {
    console.error(error)
  }

  return ""
}

export const formatRelativeTime = (
  value: FormatValue,
  targetDate: Date = new Date(),
) => {
  if (!isValidDateValue(value)) return ""
  const date = toDate(value)

  const isPast = isBefore(date, targetDate)
  const duration = intervalToDuration({
    start: isPast ? date : targetDate,
    end: isPast ? targetDate : date,
  })

  const diffInSec = Math.abs(differenceInSeconds(date, targetDate))

  if (diffInSec < 1) {
    return "Now"
  }

  const formatted = formatDuration(duration, {
    format:
      diffInSec < 60
        ? ["seconds"]
        : ["years", "months", "days", "hours", "minutes"],
  })

  return isPast ? `${formatted} ago` : `In ${formatted}`
}

export const formatInterval = (
  value: FormatValue,
  options: Record<string, unknown> = {},
) => {
  if (typeof value !== "number") {
    return ""
  }

  const isShort = options.format === "short"

  return humanizer.humanize(value, {
    round: true,
    largest: 2,
    ...(isShort && { language: "shortEn", conjunction: " ", spacer: "" }),
  })
}
