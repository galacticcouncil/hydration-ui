import {
  addMilliseconds,
  differenceInDays,
  format,
  formatDistanceToNowStrict,
  isBefore,
  Locale,
} from "date-fns"
import { enUS } from "date-fns/locale"
import { z } from "zod"
import { BigNumberLikeType, normalizeBigNumber } from "./balance"
import BigNumber from "bignumber.js"
import { BN_10, UNIFIED_ADDRESS_FORMAT_ENABLED } from "./constants"
import { isAnyParachain, Maybe } from "utils/helpers"
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto"
import { intervalToDuration, formatDuration } from "date-fns"
import { HYDRA_ADDRESS_PREFIX } from "utils/api"
import {
  H160,
  isEvmAccount,
  isEvmAddress,
  safeConvertAddressH160,
} from "utils/evm"
import { chainsMap } from "@galacticcouncil/xcm-cfg"

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

export const formatRelativeTime = (
  sourceDate: Date,
  targetDate: Date,
  locales?: string | string[],
) => {
  const units = {
    year: 24 * 60 * 60 * 1000 * 365,
    month: (24 * 60 * 60 * 1000 * 365) / 12,
    day: 24 * 60 * 60 * 1000,
    hour: 60 * 60 * 1000,
    minute: 60 * 1000,
    second: 1000,
  } as const

  const formatter = new Intl.RelativeTimeFormat(locales, { numeric: "auto" })
  const elapsed = sourceDate.valueOf() - targetDate.valueOf()

  for (const key in units) {
    const unit = key as keyof typeof units
    if (Math.abs(elapsed) > units[unit] || unit === "second") {
      return formatter.format(Math.round(elapsed / units[unit]), unit)
    }
  }

  return null
}

export const BigNumberFormatOptionsSchema = z
  .object({
    fixedPointScale: z.union([z.number(), z.string()]).optional(),
    decimalPlaces: z.union([z.number(), z.string()]).optional(),
    zeroIntDecimalPlacesCap: z
      .union([
        z.number(),
        z.string(),
        z.object({ toString: z.unknown() }).passthrough(),
      ])
      .optional(),
    numberPrefix: z.string().optional(),
    numberSuffix: z.string().optional(),
    type: z
      .union([z.literal("dollar"), z.literal("token"), z.literal("percentage")])
      .default("token")
      .optional(),
  })
  .refine((data) => Object.keys(data).length >= 1)

export type BalanceFormatOptions = z.infer<typeof BigNumberFormatOptionsSchema>

/**
 * TODO: write tests
 *
 * https://www.notion.so/Number-formatting-e26c4fa5c3564773a57711dfd854e28c
 *
 * Percentage:
 * - Display only 2 decimals, by cutting them not rounding
 * - If the integer number is 0 display 2 decimals
 * - If the percentage number is bigger than 99.99% (2 digits) don’t show any decimals
 * - Last integer unit is separated from decimals with a DOT symbol (.)
 *
 * Examples:
 *
 * - 12.345%     =>     12.34%
 * - 0.345%      =>      0.34%
 * - 99.991%     =>       100%
 *
 *
 * Dollar value:
 * Display only 2 decimals, by cutting them not rounding
 * Separate integers numbers with a space in group of 3 digits
 * If dollar value equals ZERO, only display, 0, without decimals
 * If dollar value is less than 0.01 show 0
 * If dollar value is higher than 999 dont show decimals
 *
 *  Examples:
 *
 * - 984.3498765   =>    984.34
 * - 1000          =>     1 000
 * - 0.009         =>         0
 * - 999           =>     1 000
 *
 *
 * Token value:
 * - If integer value is higher than 999.9999 show only 2 decimals
 * - If the integer number is equal or less than 0 display a maximum of 6  decimals, by cutting them not rounding
 * - If token value equals ZERO, only display, 0, without decimals
 * - If the final digit of the amount is 0 decimal it should be round it up
 * - If token balance is higher than 99 999.99 don’t show decimals
 * - If token balance is higher than 9 999.9999 only show 2 decimals
 *
 * Examples:
 *
 * - 1 234.56789    =>     1 234.56
 * - 0.034556722    =>     0.034556
 * - 234.56700      =>      234.567
 * - 99 999.99      =>      100 000
 * - 9 999.9999     =>    10 000.99
 *
 */
export function formatBigNumber(
  value: Maybe<BigNumberLikeType>,
  options?: Maybe<z.infer<typeof BigNumberFormatOptionsSchema>>,
  locale?: string | string[],
) {
  BigNumber.config({ ROUNDING_MODE: BigNumber.ROUND_DOWN })

  if (value == null) return null
  let num = normalizeBigNumber(value)
  if (num.isNaN()) return "-"

  const localeOptions = getFormatSeparators(locale)
  const fmtConfig = {
    prefix: options?.numberPrefix ?? "",
    suffix: options?.numberSuffix ?? "",
    decimalSeparator: localeOptions.decimal ?? ".",
    groupSeparator: String.fromCharCode(160), // non-breaking space
    groupSize: 3,
  }

  if (options?.fixedPointScale != null) {
    num = num.div(BN_10.pow(Number(options.fixedPointScale)))
  }

  /*
    If any type value equals ZERO, only display, 0, without decimals
    If dollar value is less than 0.01 show 0
  */
  if (num.eq(0) || (options?.type === "dollar" && num.lt(0.01))) {
    return BigNumber(0).toFormat(fmtConfig)
  }

  /* If dollar value is higher than 999 dont show decimals */
  if (options?.type === "dollar" && num.gt(999)) {
    return num.toFormat(0, fmtConfig)
  }

  if (
    options?.type === "percentage" &&
    options.decimalPlaces === "0" &&
    num.gt(1)
  ) {
    return num.toFormat(0, BigNumber.ROUND_HALF_UP, fmtConfig)
  }

  /* If the percentage number is bigger than 99.99% (2 digits) don’t show any decimals */
  if (options?.type === "percentage" && num.gt(99.99)) {
    return num.toFormat(0, BigNumber.ROUND_HALF_UP, fmtConfig)
  }

  /* If decimal places is not set, display 2 decimals by default for percentages */
  if (options?.type === "percentage" && !options.decimalPlaces) {
    return num.toFormat(2, BigNumber.ROUND_HALF_UP, fmtConfig)
  }

  /* Display only 2 decimals, by cutting them not rounding */
  if (options?.type !== "token") {
    return num
      .decimalPlaces(Number(options?.decimalPlaces ?? 2))
      .toFormat(fmtConfig)
  }

  /*If token balance is higher than 99 999.99 don’t show decimals */
  if (num.gt(99999.9999)) {
    return num.toFormat(0, fmtConfig)
  }

  /*If integer value is higher than 999.9999 show only 2 decimals. */
  if (num.gt(999.9999)) {
    return num.decimalPlaces(2).toFormat(fmtConfig)
  }

  /* If the integer number is equal or less than 0 display a maximum of 6 decimals, by cutting them not rounding */
  /* If the final digit of the amount is 0 decimal it should be round it up. */
  if (num.lt(0.000001)) {
    return num
      .decimalPlaces(4, BigNumber.ROUND_UP)
      .toFormat({ ...fmtConfig, prefix: "<" })
  }

  /* If the integer number is equal or less than 0 display a maximum of 6 decimals, by cutting them not rounding */
  if (num.lt(1)) {
    return num
      .decimalPlaces(
        typeof options?.decimalPlaces === "number" ? options.decimalPlaces : 6,
      )
      .toFormat(fmtConfig)
  }

  return num.decimalPlaces(4).toFormat(fmtConfig)
}

export function shortenAccountAddress(address: string, length = 6) {
  return `${address.substring(0, length)}...${address.substring(
    address.length - length,
  )}`
}

export function safeConvertAddressSS58(
  address: Maybe<string>,
  ss58prefix: number,
  useUnifiedFormat = UNIFIED_ADDRESS_FORMAT_ENABLED,
) {
  try {
    return encodeAddress(
      decodeAddress(address),
      useUnifiedFormat ? 0 : ss58prefix,
    )
  } catch {
    return null
  }
}

export function getChainSpecificAddress(
  address: string,
  useUnifiedFormat = UNIFIED_ADDRESS_FORMAT_ENABLED,
) {
  if (isEvmAccount(address)) {
    return H160.fromAccount(address)
  }

  if (isEvmAddress(address)) {
    return safeConvertAddressH160(address) ?? ""
  }

  const variants = getAddressVariants(address)
  return useUnifiedFormat ? variants.polkadotAddress : variants.hydraAddress
}

/**
 * Format asset value by 3 digits
 */
export const formatAssetValue = (value: string) => {
  if (value == null) return ""
  let parts = value.toString().split(".")
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  return parts.join(".")
}

export const isHydraAddress = (address: string) => address[0] === "7"

export const getAddressVariants = (address: string) => {
  const isHydraVariant = isHydraAddress(address)
  const hydraAddress = isHydraVariant
    ? address
    : safeConvertAddressSS58(address, HYDRA_ADDRESS_PREFIX, false) ?? ""

  const polkadotAddress = safeConvertAddressSS58(address, 0) ?? ""

  return { hydraAddress, polkadotAddress }
}

const formatDistanceLocale = {
  xSeconds: "{{count}}sec",
  xMinutes: "{{count}}min",
  xHours: "{{count}}h",
  xDays: "{{count}}d",
  xMonths: "{{count}}m",
  xYears: "{{count}}y",
}
const shortEnLocale = {
  formatDistance: (token: "xSeconds" | "xMinutes" | "xHours", count: string) =>
    formatDistanceLocale[token].replace("{{count}}", count),
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
  const isPositive = BigNumber(end).isPositive()
  const durations = intervalToDuration({ start, end })

  return {
    duration: formatDuration(durations, {
      format: ["months", "weeks", "days", "hours", "minutes"],
      locale: isShort ? shortEnLocale : undefined,
    }),
    isPositive,
  }
}

export const durationInDaysAndHoursFromNow = (milliseconds: number) => {
  const now = new Date()
  const end = addMilliseconds(now, milliseconds)

  if (isBefore(end, now)) return undefined

  if (differenceInDays(end, now))
    return formatDistanceToNowStrict(end, {
      unit: "day",
      roundingMethod: "floor",
    })

  return customFormatDuration({ end: milliseconds }).duration
}

export const qs = (
  query: Record<string, any>,
  { preppendPrefix = true, prefix = "?" } = {},
): string => {
  if (!query) {
    return ""
  }
  const keys = Object.keys(query)

  if (!keys.length) {
    return ""
  }

  const params = new URLSearchParams()

  keys.forEach((key) => {
    const value = query[key]

    if (typeof value === "undefined") {
      return
    }

    if (Array.isArray(value)) {
      value.map((item) => params.append(key, item))
    } else {
      params.append(key, value)
    }
  })

  const querystring = params.toString()

  return preppendPrefix ? `${prefix}${querystring}` : querystring
}

const SUBSCAN_PATHS = {
  address: "account",
  block: "block",
  bounty: "bounty",
  council: "council",
  democracyProposal: "democracy_proposal",
  democracyReferendum: "referenda",
  extrinsic: "extrinsic",
  fellowshipReferenda: "fellowship",
  referenda: "referenda_v2",
  techcomm: "tech",
  tip: "treasury_tip",
  treasury: "treasury",
  validator: "validator",
}

export function createSubscanLink(
  path: keyof typeof SUBSCAN_PATHS,
  data: BigNumber | number | string,
  chainKey: string = "hydration",
) {
  const chain = chainsMap.get(chainKey)

  if (chain && isAnyParachain(chain) && chain.explorer) {
    return `${chain.explorer}/${path}/${data.toString()}`
  } else {
    return ""
  }
}

export const wsToHttp = (url: string) =>
  url.replace(/^(ws)(s)?:\/\//, (_, _insecure, secure) =>
    secure ? "https://" : "http://",
  )

export const humanizeUnderscoredString = (value: string) => {
  return value.split("_").join(" ").toUpperCase()
}
