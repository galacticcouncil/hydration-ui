import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { XcSwapTrade } from "@galacticcouncil/xc-swap"
import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { XcSwapFormValues } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapForm"
import {
  TransactionType,
  TransactionXcSwapMeta,
  useTransactionsStore,
} from "@/states/transactions"
import { scaleHuman } from "@/utils/formatting"

// trade.maxRelayFee is denominated in ETH/WETH wei (18 decimals).
const RELAY_FEE_DECIMALS = 18

export const useSubmitXcSwap = () => {
  const { t } = useTranslation(["common", "trade"])
  const { createTransaction } = useTransactionsStore()

  return useMutation({
    mutationFn: async ([values, trade]: [XcSwapFormValues, XcSwapTrade]) => {
      const { srcAsset, srcAmount, destChain, destAsset, destAddress } = values

      if (!srcAsset) throw new Error("Source asset is required")
      if (!destChain) throw new Error("Destination chain is required")
      if (!destAsset) throw new Error("Destination asset is required")
      if (!destAddress) throw new Error("Destination address is required")

      // Firm quote — network call that yields the deposit address + calls.
      const { calls, depositAddress, intentId, correlationId } =
        await trade.buildCall()

      console.log({ calls })

      // calls = [approve?, swapAndBridge]; approve is omitted when the emitter
      // already has allowance over the source asset.
      const swapAndBridge = calls[calls.length - 1]
      if (!swapAndBridge) throw new Error("Failed to build the swap call")
      const approve = calls.length > 1 ? calls[0] : undefined

      const i18nVars = {
        amount: t("currency", {
          value: srcAmount,
          symbol: srcAsset.symbol,
        }),
        srcSymbol: srcAsset.symbol,
        dstSymbol: destAsset.symbol,
        dstChain: destChain.name,
      }

      const toasts = {
        submitted: t("trade:xcSwap.swap.toast.submitted", i18nVars),
        success: t("trade:xcSwap.swap.toast.success", i18nVars),
        error: t("trade:xcSwap.swap.toast.error", i18nVars),
      }

      const meta: TransactionXcSwapMeta = {
        type: TransactionType.XcSwap,
        srcChainKey: HYDRATION_CHAIN_KEY,
        srcAssetSymbol: srcAsset.symbol,
        srcAmount,
        srcChainFee: trade.maxFeeIn.toDecimal(),
        srcChainFeeSymbol: trade.maxFeeIn.symbol,
        dstChainKey: destChain.key,
        dstAssetSymbol: destAsset.symbol,
        dstAmount: trade.amountOut.toDecimal(),
        dstAddress: destAddress,
        dstChainFee: scaleHuman(trade.maxRelayFee, RELAY_FEE_DECIMALS),
        dstChainFeeSymbol: "ETH",
        intentId,
        depositAddress,
        correlationId,
      }

      // Sequence approve → swapAndBridge so the allowance lands first (it's
      // per-asset, so a prior approve of another asset doesn't carry over).
      if (approve) {
        return createTransaction({
          tx: [
            {
              tx: approve,
              stepTitle: "Approve",
              toasts: {
                submitted: `Approving ${i18nVars.srcSymbol}`,
                success: `${i18nVars.srcSymbol} approved`,
              },
              meta: {
                type: TransactionType.EvmApprove,
                srcChainKey: HYDRATION_CHAIN_KEY,
              },
            },
            {
              tx: swapAndBridge,
              stepTitle: "Swap",
              toasts,
              meta,
            },
          ],
        })
      }

      return createTransaction({ tx: swapAndBridge, toasts, meta })
    },
  })
}
