import { BN } from "@polkadot/util"
import { BN_10 } from "./constants"
import BigNumber from "bignumber.js"

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
