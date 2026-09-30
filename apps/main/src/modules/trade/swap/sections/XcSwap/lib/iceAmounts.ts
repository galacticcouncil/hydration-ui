import { Trade, TradeType } from "@galacticcouncil/sdk-next/sor"
import Big from "big.js"

import { calculateSlippage } from "@/api/utils/slippage"

/**
 * On-chain intent amounts after slippage padding: `amountIn` is spent in full,
 * `amountOut` is the guaranteed floor. A buy pays the padded max to receive at
 * least the exact buy amount. useSubmitSwap builds the intent from these.
 */
export const getIceSwapAmounts = (
  swap: Trade,
  slippagePct: number,
): { amountIn: bigint; amountOut: bigint } =>
  swap.type === TradeType.Buy
    ? {
        amountIn: swap.amountIn + calculateSlippage(swap.amountIn, slippagePct),
        amountOut: swap.amountOut,
      }
    : {
        amountIn: swap.amountIn,
        amountOut:
          swap.amountOut - calculateSlippage(swap.amountOut, slippagePct),
      }

/**
 * Human sell amount an ICE buy actually spends: the quoted amount plus the
 * slippage padding from getIceSwapAmounts. Validate the balance against this.
 */
export const getIceBuySellAmount = (
  sellAmount: string,
  slippagePct: number,
): string =>
  Big(sellAmount || "0")
    .times(Big(100).plus(slippagePct))
    .div(100)
    .toString()
