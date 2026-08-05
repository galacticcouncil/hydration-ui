import { Trade, TradeType } from "@/api/trade"
import { calculateSlippage } from "@/api/utils/slippage"

/**
 * The amounts a market intent actually commits on-chain, mirroring
 * IntentMarketTxBuilder:
 *
 *   Sell → amount_out = quote − slippage (guaranteed receive floor)
 *   Buy  → amount_in  = quote + slippage (the exact spend — reserved
 *          and fully consumed on fill)
 *
 * The Market form displays these instead of the raw router quote so
 * what the user sees always matches the extrinsic they sign.
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
