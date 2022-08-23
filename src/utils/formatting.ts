import { format, Locale } from "date-fns"
import { enUS } from "date-fns/locale"

export const formatNum = (
  number?: number | string,
  options?: Intl.NumberFormatOptions,
  locales?: string | string[],
): string | null => {
  if (number === undefined) return null

  try {
    const n = typeof number === "number" ? number : parseFloat(number)
    return new Intl.NumberFormat(locales, options).format(n)
  } catch (err) {
    return null
  }
}

export const formatDate = (
  date: Date,
  formatting: string,
  locale?: Locale,
): string => {
  return format(date, formatting, { locale: locale || enUS })
}
