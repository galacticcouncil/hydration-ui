import {
  addMilliseconds,
  differenceInDays,
  FormatDistanceToken,
  formatDistanceToNowStrict,
  formatDuration,
  intervalToDuration,
  isBefore,
  Locale,
} from "date-fns"

export function wsToHttp(url: string) {
  return url.replace(/^(ws)(s)?:\/\//, (_, _insecure, secure) =>
    secure ? "https://" : "http://",
  )
}

export const shorten = (
  string: string,
  fromStart = 10,
  fromEnd = 0,
): string => {
  if (typeof string !== "string") {
    return ""
  }

  if (string.length <= fromStart + fromEnd + 1) {
    return string
  }

  const start = string.slice(0, fromStart).trim()
  const end = fromEnd > 0 ? string.slice(fromEnd * -1) : ""

  return fromStart > 0 ? `${start}...${end}` : string
}

export const shortenAccountAddress = (address: string, length = 6): string =>
  shorten(address, length, length)

const formatDistanceLocale: Partial<Record<FormatDistanceToken, string>> = {
  xSeconds: "{{count}}sec",
  xMinutes: "{{count}}min",
  xHours: "{{count}}h",
  xDays: "{{count}}d",
  xMonths: "{{count}}m",
  xYears: "{{count}}y",
}

const shortEnLocale: Pick<Locale, "formatDistance"> = {
  formatDistance: (token, count) =>
    formatDistanceLocale[token]?.replace("{{count}}", count.toString()) ?? "",
}

export const customFormatDuration = ({
  start = 0,
  end,
  isShort,
}: {
  start?: number
  end: number
  isShort?: boolean
}) => {
  const isPositive = end > 0
  const durations = intervalToDuration({ start, end })

  return {
    duration: formatDuration(durations, {
      format: ["months", "weeks", "days", "hours", "minutes", "seconds"],
      locale: isShort ? shortEnLocale : undefined,
    }),
    isPositive,
  }
}

export const durationInDaysAndHoursFromNow = (
  milliseconds: number,
): string | undefined => {
  const now = new Date()
  const end = addMilliseconds(now, milliseconds)

  if (isBefore(end, now)) {
    return undefined
  }

  if (differenceInDays(end, now)) {
    return formatDistanceToNowStrict(end, {
      unit: "day",
      roundingMethod: "floor",
    })
  }

  return customFormatDuration({ end: milliseconds }).duration
}
