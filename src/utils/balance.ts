import BigNumber from "bignumber.js"
import { BN_10 } from "./constants"

export const getBalanceAmount = (amount: BigNumber, decimals = 18) => {
  return new BigNumber(amount).dividedBy(BN_10.pow(decimals))
}

export const getFullDisplayBalance = (
  balance: BigNumber,
  decimals: string | number = 12,
  displayDecimals: string | number = 12,
) => {
  const parsedDecimals =
    typeof decimals === "string" ? parseInt(decimals, 10) : decimals
  const parsedDisplayDecimals =
    typeof displayDecimals === "string"
      ? parseInt(displayDecimals, 10)
      : displayDecimals
  return balance.isNaN()
    ? "-"
    : getBalanceAmount(balance, parsedDecimals).toFixed(parsedDisplayDecimals)
}
