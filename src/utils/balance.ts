import BigNumber from "bignumber.js"
import { BN_10 } from "./constants"

export const getBalanceAmount = (amount: BigNumber, decimals = 12) => {
  return new BigNumber(amount).dividedBy(BN_10.pow(decimals))
}

export const getDecimalAmount = (
  amount: BigNumber,
  decimals: string | number = 12,
) => {
  const parsedDecimals =
    typeof decimals === "string" ? parseInt(decimals, 10) : decimals

  return new BigNumber(amount).times(BN_10.pow(parsedDecimals))
}

export const getFullDisplayBalance = (
  balance: BigNumber | undefined,
  decimals: string | number = 12,
  displayDecimals: string | number = 12,
) => {
  const parsedDecimals =
    typeof decimals === "string" ? parseInt(decimals, 10) : decimals
  const parsedDisplayDecimals =
    typeof displayDecimals === "string"
      ? parseInt(displayDecimals, 10)
      : displayDecimals
  return !balance || balance.isNaN()
    ? "-"
    : getBalanceAmount(balance, parsedDecimals).toFixed(parsedDisplayDecimals)
}
