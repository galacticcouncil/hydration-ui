import { BN } from "@polkadot/util"
import { BN_10, BN_NAN, QUINTILL, TRILL } from "./constants"
import BigNumber from "bignumber.js"
import {
  BigNumberFormatOptionsSchema,
  formatBigNumber,
  getFormatSeparators,
} from "./formatting"
import { z } from "zod"
import i18n from "i18next"
import { Maybe } from "./helpers"

export type BigNumberLikeType = BN | BigNumber | number | string

export function normalizeBigNumber(value: BigNumberLikeType): BigNumber
export function normalizeBigNumber(value: null | undefined): null
export function normalizeBigNumber(
  value: BigNumberLikeType | null | undefined,
): BigNumber | null {
  if (value == null) return null

  // BigNumber.js instance
  if (BigNumber.isBigNumber(value)) return value

  // BN.js instance returned from @polkadot-js/api
  if (BN.isBN(value)) return new BigNumber(value.toString())

  // string value or number
  return new BigNumber(value)
}

export const getFloatingPointAmount = (
  amount: BigNumberLikeType,
  decimals: string | number,
) => {
  return normalizeBigNumber(amount).dividedBy(BN_10.pow(decimals))
}

export const getFixedPointAmount = (
  amount: BigNumberLikeType,
  decimals: string | number,
) => {
  return normalizeBigNumber(amount)?.times(BN_10.pow(decimals))
}

/**
 *
 * @param amount value to scale
 * @param decimals number of shifted places
 * @returns The shift is of the decimal point, i.e. of powers of ten, and is to the right.
 * eg.: 1.23456789 => 123456789
 */
export const scale = (
  amount: BigNumberLikeType | undefined,
  decimals: number | "t" | "q",
) => {
  if (!amount) return BN_NAN

  const _decimals =
    decimals === "t" ? TRILL : decimals === "q" ? QUINTILL : decimals

  return normalizeBigNumber(amount).shiftedBy(_decimals)
}

/**
 *
 * @param amount value to scale
 * @param decimals number of shifted places
 * @returns The shift is of the decimal point, i.e. of powers of ten, and is to the left.
 * eg.: 123456789 => 1.23456789
 */
export const scaleHuman = (
  amount: BigNumberLikeType | undefined,
  decimals: number | "t" | "q",
) => {
  if (!amount) return BN_NAN

  const _decimals =
    decimals === "t" ? TRILL : decimals === "q" ? QUINTILL : decimals

  return normalizeBigNumber(amount).shiftedBy(-_decimals)
}

export const separateBalance = (
  value: Maybe<BigNumber>,
  options?: z.infer<typeof BigNumberFormatOptionsSchema>,
) => {
  if (!value || value?.isNaN()) return { num: "-", denom: "" }
  const formatted = formatBigNumber(value, options, i18n.languages[0])
  const separators = getFormatSeparators(i18n.languages[0])
  if (formatted) {
    const [num, denom = ""] = formatted.split(separators.decimal ?? ".")

    return {
      num: `${num}${denom.length ? "." : ""}`,
      denom,
    }
  }
  return { num: "-", denom: "" }
}
