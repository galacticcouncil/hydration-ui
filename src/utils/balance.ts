import BigNumber from "bignumber.js"
import { BN_10 } from "./constants"

export const getBalanceAmount = (amount: BigNumber, decimals = 18) => {
  return new BigNumber(amount).dividedBy(BN_10.pow(decimals))
}

export const getFullDisplayBalance = (
  balance: BigNumber,
  decimals = 18,
  displayDecimals = 18,
) => {
  return balance.isNaN()
    ? "-"
    : getBalanceAmount(balance, decimals).toFixed(displayDecimals)
}
