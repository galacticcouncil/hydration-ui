/* eslint-disable @typescript-eslint/no-explicit-any */
import { getTimeFrameMillis } from "@galacticcouncil/main/src/components/TimeFrame/TimeFrame.utils"
import { TradeDcaOrder } from "@galacticcouncil/sdk-next/sor"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import {
  DcaFormValues,
  DcaOrdersMode,
} from "@/modules/trade/swap/sections/DCA/useDcaForm"
import { AnyTransaction } from "@/modules/transactions/types"
import { isErc20AToken, TAsset } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"
import { useTransactionsStore } from "@/states/transactions"
import { scaleHuman } from "@/utils/formatting"

// The Intent pallet works with native asset IDs. ERC20 wrapper tokens
// (e.g. HUSDT 1111) must be mapped to their underlying asset (USDT 111).
// Mirrored from useSubmitLimitOrder — hoist once we factor a shared util.
const getIntentAssetId = (asset: TAsset): number => {
  if (isErc20AToken(asset)) {
    return Number(asset.underlyingAssetId)
  }
  return Number(asset.id)
}

/**
 * Submits a DCA order as an ICE Intent (`Intent.submit_intent` with the
 * `Dca` data variant). Replaces the previous `DCA.schedule` extrinsic
 * path built by sdk-next's `OrderTxBuilder`.
 *
 * The preview (`TradeDcaOrder` from `dcaTradeOrderQuery`) is kept
 * unchanged — it drives the form UI, warnings, health-factor check.
 * Only the final transaction construction moves to the Intent pallet.
 *
 * Mapping of `TradeDcaOrder` + form → Intent.Dca payload:
 *   asset_in  = `getIntentAssetId(sellAsset)` (unwraps ERC20 A-tokens)
 *   asset_out = `getIntentAssetId(buyAsset)`
 *   amount_in  = `order.tradeAmountIn`   (per-trade, native bigint)
 *   amount_out = `order.tradeAmountOut`  (per-trade, native bigint)
 *   slippage   = `slippagePct * 10_000`  (Permill)
 *   budget     = LimitedBudget → `order.amountIn`; OpenBudget → undefined
 *   period     = `order.tradePeriod`     (blocks)
 *   deadline   = undefined (matches old DCA: runs until budget exhausts
 *                 or user cancels; OpenBudget runs until balance runs out)
 *
 * Dropped fields (no Intent equivalent): `max_retries`, `beneficiary`,
 * `route`, `stability_threshold`, `start_execution_block`.
 */
export const useSubmitDcaOrder = () => {
  const { t } = useTranslation(["common", "trade"])

  const { account } = useAccount()
  const address = account?.address

  const { papiClient } = useRpcProvider()
  const {
    dca: { slippage: slippagePct },
  } = useTradeSettings()

  const { createTransaction } = useTransactionsStore()
  const queryClient = useQueryClient()

  return useMutation({
    // Signature kept for caller compatibility — `_orderTx` is no longer
    // used (we build our own Intent.submit_intent extrinsic below).
    mutationFn: async ([formValues, order, _orderTx]: [
      DcaFormValues,
      TradeDcaOrder,
      AnyTransaction,
    ]) => {
      const { sellAsset, buyAsset, sellAmount, orders } = formValues

      if (!sellAsset || !buyAsset || !address) {
        return
      }

      const sellDecimals = sellAsset.decimals
      const sellSymbol = sellAsset.symbol
      const buySymbol = buyAsset.symbol
      const duration = getTimeFrameMillis(formValues.duration)
      const frequency = order.tradeCount > 0 ? duration / order.tradeCount : 0
      const isOpenBudget = orders.type === DcaOrdersMode.OpenBudget

      // Permill = parts per million (u32, 0..=1_000_000). sdk-next's
      // OrderTxBuilder uses `slippagePct * 1e4` (1% → 10_000 Permill).
      // Clamp defensively: the form validator caps the setting but the
      // runtime rejects values > 1_000_000 outright.
      const slippagePermill = Math.max(
        0,
        Math.min(1_000_000, Math.round(slippagePct * 10_000)),
      )

      // Runtime enforces `period >= MinDcaPeriod` (5 blocks on-chain).
      // sdk-next already floors to 6, but this guards against future
      // SDK changes / preview quirks.
      const period = Math.max(order.tradePeriod, 6)

      const unsafeApi = papiClient.getUnsafeApi() as any
      const tx = unsafeApi.tx.Intent.submit_intent({
        intent: {
          data: {
            type: "Dca",
            value: {
              asset_in: getIntentAssetId(sellAsset),
              asset_out: getIntentAssetId(buyAsset),
              amount_in: order.tradeAmountIn,
              amount_out: order.tradeAmountOut,
              slippage: slippagePermill,
              // OpenBudget → no cap → chain runs intent until balance
              // runs out or user cancels.
              budget: isOpenBudget ? undefined : order.amountIn,
              period,
            },
          },
          // No deadline: the intent lives until budget exhausts (Limited)
          // or user cancels (Open). Matches the old DCA.schedule
          // behaviour which had no expiry.
          deadline: undefined,
          on_resolved: undefined,
        },
      })

      const params = {
        amountIn: t("currency", {
          value: scaleHuman(order.tradeAmountIn, sellDecimals),
          symbol: sellSymbol,
        }),
        amountInBudget: t("currency", {
          value: sellAmount,
          symbol: sellSymbol,
        }),
        assetOut: buySymbol,
        frequency: isOpenBudget ? duration : frequency,
      }

      return createTransaction(
        {
          tx,
          toasts: {
            submitted: t(
              `trade:dca.${isOpenBudget ? "openBudget" : "limitedBudget"}.tx.loading`,
              params,
            ),
            success: t(
              `trade:dca.${isOpenBudget ? "openBudget" : "limitedBudget"}.tx.success`,
              params,
            ),
            error: t(
              `trade:dca.${isOpenBudget ? "openBudget" : "limitedBudget"}.tx.error`,
              params,
            ),
          },
        },
        {
          onSuccess: () => {
            // Make the newly-created intent show up in Open Orders
            // without waiting for the polling interval.
            queryClient.invalidateQueries({
              queryKey: ["intents", "byAccount", address],
            })
          },
        },
      )
    },
  })
}
