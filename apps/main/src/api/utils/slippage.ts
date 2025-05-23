import { Amount } from "@galacticcouncil/sdk-next"
import { Trade } from "@galacticcouncil/sdk-next/build/types/sor"
import Big from "big.js"

export const PCT_100 = "100"

export function calculateSlippage(amount: bigint, slippagePct: string): bigint {
  const slippage = Big(amount.toString()).div(PCT_100).mul(slippagePct)
  return BigInt(slippage.toFixed(0, 1))
}

export function getTradeMinAmountOut(sell: Trade, slippagePct: string): Amount {
  const assetOutDecimals =
    sell.swaps[sell.swaps.length - 1]?.assetOutDecimals ?? 0
  return getMinAmountOut(sell.amountOut, assetOutDecimals, slippagePct)
}

export function getMinAmountOut(
  amountOut: bigint,
  assetOutDecimals: number,
  slippagePct: string,
): Amount {
  const slippage = calculateSlippage(amountOut, slippagePct)
  const minAmountOut = amountOut - slippage

  return {
    amount: minAmountOut,
    decimals: assetOutDecimals,
  }
}

export function getTradeMaxAmountIn(buy: Trade, slippagePct: string): Amount {
  const assetInDecimals = buy.swaps[0]?.assetInDecimals ?? 0
  return getMaxAmountIn(buy.amountIn, assetInDecimals, slippagePct)
}

export function getMaxAmountIn(
  amountIn: bigint,
  assetInDecimals: number,
  slippagePct: string,
): Amount {
  const slippage = calculateSlippage(amountIn, slippagePct)
  const maxAmountIn = amountIn + slippage

  return {
    amount: maxAmountIn,
    decimals: assetInDecimals,
  } as Amount
}
