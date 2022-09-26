import { format, Locale } from "date-fns"
import { enUS } from "date-fns/locale"
import { z } from "zod"
import { BigNumberLikeType, normalizeBigNumber } from "./balance"
import { Maybe } from "./types"
import BigNumber from "bignumber.js"
import { BN_10 } from "./constants"

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

export const getFormatSeparators = (locales: string | string[] | undefined) => {
  const parts = new Intl.NumberFormat(locales).formatToParts(1000.1)
  const group = parts.find((i) => i.type === "group")?.value
  const decimal = parts.find((i) => i.type === "decimal")?.value
  return { group, decimal }
}

export const formatDate = (
  date: Date,
  formatting: string,
  locale?: Locale,
): string => {
  return format(date, formatting, { locale: locale || enUS })
}

export const BigNumberFormatOptionsSchema = z
  .object({
    fixedPointScale: z
      .union([
        z.number(),
        z.string(),
        z.object({ toString: z.unknown() }).passthrough(),
      ])
      .optional(),
    decimalPlaces: z
      .union([
        z.number(),
        z.string(),
        z.object({ toString: z.unknown() }).passthrough(),
      ])
      .optional(),
    numberPrefix: z.string().optional(),
    numberSuffix: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length >= 1)

export type BalanceFormatOptions = z.infer<typeof BigNumberFormatOptionsSchema>

export function formatBigNumber(
  value: Maybe<BigNumberLikeType>,
  options?: Maybe<z.infer<typeof BigNumberFormatOptionsSchema>>,
  locale?: string | string[],
) {
  if (value == null) return null
  let num = normalizeBigNumber(value)

  const localeOptions = getFormatSeparators(locale)
  const fmtConfig: BigNumber.Format = {
    prefix: options?.numberPrefix ?? "",
    suffix: options?.numberSuffix ?? "",
    decimalSeparator: localeOptions.decimal ?? ".",
    groupSeparator: localeOptions.group ?? ",",
    groupSize: 3,
  }

  if (options?.fixedPointScale != null) {
    num = num.div(BN_10.pow(options.fixedPointScale?.toString()))
  }

  if (options?.decimalPlaces != null) {
    return num.toFormat(
      Number.parseInt(options.decimalPlaces?.toString(), 10),
      fmtConfig,
    )
  }

  return num.toFormat(fmtConfig)
}
