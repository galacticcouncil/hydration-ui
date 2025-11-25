import { big } from "@galacticcouncil/common"
import Big from "big.js"

export const TRILL_DECIMALS = 12
export const QUINTILL_DECIMALS = 18

const normalizeValue = (value: string | number | bigint) => {
  if (typeof value === "bigint") return value
  //if (typeof value === "string") return BigInt(value)

  return BigInt(value)
}

/**
 *
 * @param amount value to scale
 * @param decimals number of shifted places
 * @returns The shift is of the decimal point, i.e. of powers of ten, and is to the right.
 * eg.: 1.23456789 => 123456789
 */
export const scale = (
  amount: string | number | bigint,
  decimals: number | "t" | "q",
) => {
  if (!amount.toString().length) return "0"

  const amountBig = new Big(
    typeof amount === "bigint" ? amount.toString() : amount,
  )

  const _decimals =
    decimals === "t"
      ? TRILL_DECIMALS
      : decimals === "q"
        ? QUINTILL_DECIMALS
        : decimals

  if (_decimals === 0) {
    return amountBig.toFixed(0, 0)
  }

  return amountBig.times(10 ** _decimals).toFixed(0, 0)
}

/**
 *
 * @param amount value to scale
 * @param decimals number of shifted places
 * @returns The shift is of the decimal point, i.e. of powers of ten, and is to the left.
 * eg.: 123456789 => 1.23456789
 */
export const scaleHuman = (
  amount: string | number | bigint,
  decimals: number | "t" | "q",
) => {
  const amountBig = new Big(
    typeof amount === "bigint" ? amount.toString() : amount,
  )

  const _decimals =
    decimals === "t"
      ? TRILL_DECIMALS
      : decimals === "q"
        ? QUINTILL_DECIMALS
        : decimals

  if (_decimals === 0 || !_decimals) {
    return amountBig.toString()
  }

  return amountBig.div(10 ** _decimals).toString()
}

export const isNegative = (amount: string | number | bigint) => {
  return normalizeValue(amount) < 0n
}

export const toDecimal = (
  amount: string | number | bigint | Big,
  decimals: number,
): string =>
  big.toDecimal(
    typeof amount === "bigint" ? amount : BigInt(amount.toString()),
    decimals,
  )

export const toBigInt = (
  amount: string | number | bigint | Big,
  decimals: number,
) =>
  big.toBigInt(
    typeof amount === "object" || typeof amount === "bigint"
      ? amount.toString()
      : amount,
    decimals,
  )
