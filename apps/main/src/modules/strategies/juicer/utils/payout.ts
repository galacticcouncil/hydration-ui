import { isPlainObject } from "remeda"

import { type JuicerVaultConfig } from "@/modules/strategies/juicer/config/vaults"
import { type AnyPapiTx } from "@/modules/transactions/types"

import { isCallNode } from "./deposit"

type DecodedCall = AnyPapiTx["decodedCall"]

const NOT_A_SELL = "The payout trade is not a router sell"

/**
 * The SDK's trade as a sell of exactly `amountIn`. The SDK emits sell_all when
 * the amount nears the balance, which would also sell collateral already held.
 * With `sellAll`, a sell of the whole balance instead: a claim pays everything
 * settled at execution, which can be more than `amountIn`, and only a wallet
 * that held no collateral before can sell all of it. Keeps the SDK's route,
 * its Dispatcher wrapper and, unless `minAmountOut` is given, its slippage
 * minimum, which a larger sell only exceeds.
 */
export const buildPayoutSell = (
  call: unknown,
  amountIn: bigint,
  {
    minAmountOut,
    sellAll = false,
  }: { minAmountOut?: bigint; sellAll?: boolean } = {},
): DecodedCall => {
  if (!isCallNode(call) || !isCallNode(call.value)) throw new Error(NOT_A_SELL)
  const { type: method, value: args } = call.value
  if (!isPlainObject(args)) throw new Error(NOT_A_SELL)

  if (call.type === "Dispatcher" && method === "dispatch_with_extra_gas")
    return {
      ...call,
      value: {
        ...call.value,
        value: {
          ...args,
          call: buildPayoutSell(args.call, amountIn, {
            minAmountOut,
            sellAll,
          }),
        },
      },
    } as DecodedCall
  if (call.type !== "Router" || (method !== "sell" && method !== "sell_all"))
    throw new Error(NOT_A_SELL)

  const limits = {
    asset_in: args.asset_in,
    asset_out: args.asset_out,
    min_amount_out: minAmountOut ?? args.min_amount_out,
    route: args.route,
  }
  return {
    type: "Router",
    value: sellAll
      ? { type: "sell_all", value: limits }
      : { type: "sell", value: { ...limits, amount_in: amountIn } },
  } as DecodedCall
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
