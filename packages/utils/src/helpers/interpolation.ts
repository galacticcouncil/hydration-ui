import { isString } from "remeda"

import {
  formatCurrency,
  formatDate,
  formatInterval,
  formatNumber,
  formatPercent,
  formatRelativeTime,
  type FormatValue,
} from "./intl"

function parseFormatStr(formatStr: string | undefined) {
  let formatName = formatStr
  const formatOptions: Record<string, unknown> = {}

  if (isString(formatStr) && formatStr.indexOf("(") > -1) {
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

export const interpolationFormat = (
  value: FormatValue,
  format?: string,
  lng?: string,
  tOptions?: Record<string, unknown>,
) => {
  const { formatName, formatOptions } = parseFormatStr(format)
  const options = { ...formatOptions, ...tOptions }

  switch (formatName) {
    case "number":
      return formatNumber(value, lng, options)

    case "percent":
      return formatPercent(value, lng, options)

    case "currency":
      return formatCurrency(value, lng, options)

    case "date":
      return formatDate(value, options)

    case "interval":
      return formatInterval(value, options)

    case "relative":
      return formatRelativeTime(
        value,
        options.targetDate instanceof Date ? options.targetDate : new Date(),
      )

    default:
      return String(value ?? "")
  }
}
