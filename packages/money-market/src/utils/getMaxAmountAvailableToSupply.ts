import { API_ETH_MOCK_ADDRESS } from "@aave/contract-helpers"
import Big from "big.js"

import { roundToTokenDecimals } from "./utils"

// Subset of ComputedReserveData
interface PoolReserveSupplySubset {
  supplyCap: string
  debtCeiling: string
  isolationModeTotalDebt: string
  totalLiquidity: string
  isFrozen: boolean
  decimals: number
}

export function remainingCap(cap: string, total: string) {
  return cap === "0" ? Big(-1) : Big(cap).minus(total)
}

export function getMaxAmountAvailableToSupply(
  walletBalance: string,
  poolReserve: PoolReserveSupplySubset,
  underlyingAsset: string,
  minRemainingBaseToken: string,
): string {
  if (poolReserve.isFrozen) {
    return "0"
  }

  // Calculate max amount to supply
  let maxAmountToSupply = Big(walletBalance)

  // keep a bit for other transactions
  if (
    maxAmountToSupply.gt(0) &&
    underlyingAsset.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase()
  ) {
    maxAmountToSupply = maxAmountToSupply.minus(minRemainingBaseToken)
  }

  // make sure we don't try to supply more then maximum supply cap
  if (poolReserve.supplyCap !== "0") {
    const remaining = remainingCap(
      poolReserve.supplyCap,
      poolReserve.totalLiquidity,
    )
    maxAmountToSupply = Big.min(
      maxAmountToSupply.toString(),
      remaining.toString(),
    )
  }

  if (maxAmountToSupply.lte(0)) {
    return "0"
  }

  // Convert amount to smallest allowed precision based on token decimals
  return roundToTokenDecimals(
    maxAmountToSupply.toString(),
    poolReserve.decimals,
  )
}
