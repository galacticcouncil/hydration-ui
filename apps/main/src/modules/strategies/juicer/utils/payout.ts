import { type Trade, TradeRouteBuilder } from "@galacticcouncil/sdk-next/sor"

import { type JuicerVaultConfig } from "@/modules/strategies/juicer/config/vaults"
import { type AnyPapiTx } from "@/modules/transactions/types"
import { type Papi } from "@/providers/rpcProvider"

/**
 * Router sell of exactly `amountIn`. Built directly: the SDK's trade builder
 * emits sell_all whenever the amount reaches the wallet's current balance,
 * which before a claim lands is nearly always, and sell_all would also sell
 * collateral the wallet already held.
 */
export const buildPayoutSell = (
  papi: Papi,
  {
    assetIn,
    assetOut,
    amountIn,
    minAmountOut,
    swaps,
    extraGas,
  }: {
    assetIn: number
    assetOut: number
    amountIn: bigint
    minAmountOut: bigint
    swaps: Trade["swaps"]
    /** set when sdk.api.aave.requiresExtraGas holds for the asset in */
    extraGas?: bigint
  },
): AnyPapiTx => {
  const sell = papi.tx.Router.sell({
    asset_in: assetIn,
    asset_out: assetOut,
    amount_in: amountIn,
    min_amount_out: minAmountOut,
    route: TradeRouteBuilder.build(swaps) as Parameters<
      typeof papi.tx.Router.sell
    >[0]["route"],
  })
  return extraGas === undefined
    ? sell
    : papi.tx.Dispatcher.dispatch_with_extra_gas({
        call: sell.decodedCall,
        extra_gas: extraGas,
      })
}

/** Payout assets a claim offers, base asset first; the first is the default. */
export const getPayoutAssetIds = (vault: JuicerVaultConfig): string[] =>
  vault.payoutAssetIds
    ? [
        ...new Set([
          ...(vault.baseAssetId ? [vault.baseAssetId] : []),
          ...vault.payoutAssetIds,
        ]),
      ]
    : [vault.assetId]

/**
 * How a claim reaches the payout: nothing to sell for the collateral itself,
 * an exact 1:1 unwrap into the product token it displays as (2-Pool-GETH to
 * GETH), a swap with a slippage limit for anything else.
 */
export const getPayoutSell = (
  vault: JuicerVaultConfig,
  payoutAssetId: string,
): "none" | "exact" | "swap" =>
  payoutAssetId === vault.assetId
    ? "none"
    : payoutAssetId === vault.collateralDisplayId
      ? "exact"
      : "swap"
