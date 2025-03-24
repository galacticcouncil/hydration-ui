import Big from "big.js"

const TRILL = 12
const QUINTILL = 18

const normalizeValue = (value: string | number | bigint) => {
  if (typeof value === "bigint") return value
  //if (typeof value === "string") return BigInt(value)

  return BigInt(value)
}

export const wsToHttp = (url: string) =>
  url.replace(/^(ws)(s)?:\/\//, (_, _insecure, secure) =>
    secure ? "https://" : "http://",
  )

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
  const amountBig = new Big(
    typeof amount === "bigint" ? amount.toString() : amount,
  )

  const _decimals =
    decimals === "t" ? TRILL : decimals === "q" ? QUINTILL : decimals

  if (_decimals === 0) {
    return BigInt(amountBig.toString())
  }

  return BigInt(amountBig.mul(10 ** _decimals).toString())
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
    decimals === "t" ? TRILL : decimals === "q" ? QUINTILL : decimals

  if (_decimals === 0) {
    return amountBig.toString()
  }

  return amountBig.div(10 ** _decimals).toString()
}

export const isNegative = (amount: string | number | bigint) => {
  return normalizeValue(amount) < 0n
}
