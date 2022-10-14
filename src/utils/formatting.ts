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
    zeroIntDecimalPlacesCap: z
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

/**
 * TODO: write tests
 *
 * Percentage:
 * - int > 0   show 2 decimal digits
 * - int <= 0  first 2 significant digits, cap to 4 digits
 *
 * 0.0000001          0.0000
 * 0.001              0.0010
 * 0.1                0.10
 * 98.0000001        98.00
 * 98.001            98.00
 * 98.1              98.10
 *
 *
 * Value:
 * - int > 0   show 4 decimal digits
 * - int <= 0  first 4 significant digits, cap to 4 digits
 *
 * 0.0000001          0.0000
 * 0.001              0.0010
 * 0.1                0.1000
 * 98.0000001        98.0000
 * 98.001            98.0010
 * 98.1              98.1000
 */
export function formatBigNumber(
  value: Maybe<BigNumberLikeType>,
  options?: Maybe<z.infer<typeof BigNumberFormatOptionsSchema>>,
  locale?: string | string[],
) {
  if (value == null) return null
  let num = normalizeBigNumber(value)

  const localeOptions = getFormatSeparators(locale)
  const fmtConfig = {
    prefix: options?.numberPrefix ?? "",
    suffix: options?.numberSuffix ?? "",
    decimalSeparator: localeOptions.decimal ?? ".",
    groupSeparator: String.fromCharCode(160), // non-breaking space
    groupSize: 3,
  }

  if (options?.fixedPointScale != null) {
    num = num.div(BN_10.pow(options.fixedPointScale?.toString()))
  }

  if (options?.decimalPlaces != null) {
    const decimalPlaces = Number.parseInt(options.decimalPlaces?.toString(), 10)
    const zeroIntDecimalPlacesCap = options.zeroIntDecimalPlacesCap
      ? Number.parseInt(options.zeroIntDecimalPlacesCap?.toString(), 10)
      : 4

    let [integerPart, fractionPart] = num
      .toFormat({ ...fmtConfig, prefix: "", suffix: "" })
      .split(fmtConfig.decimalSeparator)

    if (decimalPlaces === 0 || new BigNumber(integerPart).gt(0))
      return num.toFormat(decimalPlaces, fmtConfig)

    // handle if input number does not have decimal places
    fractionPart = (fractionPart ?? "").padEnd(2, "0")

    // count the number of prefix zeroes
    let numZeroes
    for (
      numZeroes = 0;
      numZeroes < fractionPart.length && fractionPart[numZeroes] === "0";
      numZeroes++
    ) {}

    const formatted =
      integerPart +
      fmtConfig.decimalSeparator +
      fractionPart.slice(
        0,
        Math.min(zeroIntDecimalPlacesCap, numZeroes + decimalPlaces),
      )

    return fmtConfig.prefix + formatted + fmtConfig.suffix
  }

  return num.toFormat(fmtConfig)
}
