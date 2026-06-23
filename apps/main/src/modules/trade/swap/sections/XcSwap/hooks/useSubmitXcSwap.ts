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

export const useSubmitXcSwap = () => {
  const { t } = useTranslation(["common", "trade"])
  const { createTransaction } = useTransactionsStore()

  return useMutation({
    mutationFn: async ([values, trade]: [XcSwapFormValues, XcSwapTrade]) => {
      const { sellAsset, sellAmount, destChain, buyAsset, destAddress } = values

      if (!sellAsset) throw new Error("Source asset is required")
      if (!destChain) throw new Error("Destination chain is required")
      if (!buyAsset) throw new Error("Destination asset is required")
      if (!destAddress) throw new Error("Destination address is required")

      const { calls, depositAddress, intentId, correlationId } =
        await trade.buildCall()

      const swapAndBridge = calls[calls.length - 1]
      if (!swapAndBridge) throw new Error("Failed to build the swap call")
      const approve = calls.length > 1 ? calls[0] : undefined

      const i18nVars = {
        amount: sellAmount,
        symbol: sellAsset.symbol,
        srcSymbol: sellAsset.symbol,
        dstSymbol: buyAsset.symbol,
        dstChain: destChain.name,
      }

      const toasts = {
        submitted: t("trade:xc.swap.toast.submitted", i18nVars),
        success: t("trade:xc.swap.toast.success", i18nVars),
      }

      const meta: TransactionXcSwapMeta = {
        type: TransactionType.XcSwap,
        srcChainKey: HYDRATION_CHAIN_KEY,
        srcAssetSymbol: sellAsset.symbol,
        srcAmount: sellAmount,
        srcChainFee: trade.fee.amount.toDecimal(),
        srcChainFeeSymbol: trade.fee.amount.symbol,
        dstChainKey: destChain.key,
        dstAssetSymbol: buyAsset.symbol,
        dstAmount: trade.amountOut.toDecimal(),
        dstAddress: destAddress,
        intentId,
        depositAddress,
        correlationId,
      }

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
