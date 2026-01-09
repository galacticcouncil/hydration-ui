import Big from "big.js"
import { isNullish } from "remeda"

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

const formatFractionDigits = (
  value: number | bigint,
  maximumFractionDigits: number,
  parts: Intl.NumberFormatPart[],
) => {
  const minValue = Math.pow(10, -maximumFractionDigits)

  if (value < minValue) {
    const newParts = parts.filter(({ type }) => type !== "fraction")
    newParts.unshift({
      type: "literal",
      value: "<",
    })
    newParts.push({
      type: "fraction",
      value: minValue.toString().split(".")[1],
    })

    return newParts.map(formatNumberParts).join("")
  }

  return parts.map(formatNumberParts).join("")
}

const isValidNumber = (
  value: number | bigint | string | null | undefined,
): value is number | bigint | string => {
  return !isNullish(value) && !Number.isNaN(Number(value)) && value !== ""
}

export const getMaxSignificantDigits = (
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

export const formatNumber = (
  value: number | bigint | string | null | undefined,
  lng = DEFAULT_LOCALE,
  options: Record<string, unknown> = {},
) => {
  if (!isValidNumber(value)) {
    return NA_VALUE
  }

  const numericValue = typeof value === "string" ? Number(value) : value

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
  value: number | bigint | null | undefined,
  lng = DEFAULT_LOCALE,
  options: Record<string, unknown> = {},
) => {
  if (!isValidNumber(value)) {
    return NA_VALUE
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
}

export const formatCurrency = (
  _value: number | bigint | string | Big | null | undefined,
  lng = DEFAULT_LOCALE,
  options: Record<string, unknown> = {},
) => {
  const value = typeof _value === "object" ? _value?.toNumber() : _value

  if (!isValidNumber(value)) {
    return NA_VALUE
  }

  const numericValue = typeof value === "string" ? Number(value) : value

  let parts = Intl.NumberFormat(lng, {
    style: "currency",
    currency: "USD",
    maximumSignificantDigits:
      options.maximumSignificantDigits || options.maximumFractionDigits
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

  if (options.maximumFractionDigits && numericValue > 0) {
    return formatFractionDigits(
      numericValue,
      Number(options.maximumFractionDigits),
      parts,
    )
  }

  return parts.map(formatNumberParts).join("")
}

const FORMAT_ASSET_AMOUNT_REGEXP =
  /^(?<integer>[^.,]*)(?<separator>[.,])(?<decimals>.*)$/

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
