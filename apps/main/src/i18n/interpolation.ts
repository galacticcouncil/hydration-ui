import {
  formatCurrency,
  formatNumber,
  formatPercent,
} from "@galacticcouncil/utils"
import {
  differenceInSeconds,
  format as formatDate,
  formatDuration,
  intervalToDuration,
  isBefore,
  isDate,
} from "date-fns"
import {
  HumanizeDuration,
  HumanizeDurationLanguage,
} from "humanize-duration-ts"
import { FormatFunction } from "i18next"

import i18n from "@/i18n"

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

const formatters = {
  number: formatNumber,
  percent: formatPercent,
  currency: formatCurrency,

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

  interval: (intervalMs: number) => {
    if (typeof intervalMs !== "number") {
      return ""
    }

    return humanizer.humanize(intervalMs, {
      round: true,
      largest: 2,
    })
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

    case "interval":
      return formatters.interval(value)

    case "relative":
      return formatters.relativeTime(value, options.targetDate ?? new Date())

    default:
      return value ?? null
  }
}
