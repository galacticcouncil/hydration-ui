import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { XcSwapTrade } from "@galacticcouncil/xc-swap"
import { useMutation } from "@tanstack/react-query"
import { minutesToMilliseconds } from "date-fns"
import waitFor from "p-wait-for"
import { useTranslation } from "react-i18next"

import { useErc20Allowance } from "@/api/evm"
import { PendingApproval } from "@/components/PendingApproval"
import { XC_SWAP_CONFIG } from "@/config/xcSwap"
import { XcSwapFormValues } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapForm"
import {
  TransactionType,
  TransactionXcSwapMeta,
  useTransactionsStore,
} from "@/states/transactions"

export const useSubmitXcSwap = () => {
  const { t } = useTranslation(["common", "trade"])
  const { createTransaction } = useTransactionsStore()
  const getErc20Allowance = useErc20Allowance()

  return useMutation({
    mutationFn: async ([values, trade]: [XcSwapFormValues, XcSwapTrade]) => {
      const { sellAsset, sellAmount, destChain, buyAsset, destAddress } = values

      if (!sellAsset) throw new Error("Source asset is required")
      if (!destChain) throw new Error("Destination chain is required")
      if (!buyAsset) throw new Error("Destination asset is required")
      if (!destAddress) throw new Error("Destination address is required")

      const { calls, depositAddress, correlationId } = await trade.buildCall()

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
        depositAddress,
        correlationId,
      }

      if (approve) {
        return createTransaction({
          tx: [
            {
              tx: approve,
              stepTitle: t("trade:xc.swap.step.approve"),
              toasts: {
                submitted: t("trade:xc.swap.approve.toast.submitted", {
                  symbol: i18nVars.srcSymbol,
                }),
                success: t("trade:xc.swap.approve.toast.success", {
                  symbol: i18nVars.srcSymbol,
                }),
              },
              meta: {
                type: TransactionType.EvmApprove,
                srcChainKey: HYDRATION_CHAIN_KEY,
              },
              pendingComponent: PendingApproval,
              // The approve has to be visible to the node the swap is priced
              // and executed against — a mined receipt on the wallet's rpc
              // isn't that. The swap step stays out of reach until then, fee
              // estimation included.
              beforeNext: async () => {
                await waitFor(
                  async () => {
                    const allowance = await getErc20Allowance(
                      approve.to,
                      approve.from,
                      XC_SWAP_CONFIG.emitter,
                    )
                    return allowance >= trade.amountIn.amount
                  },
                  {
                    interval: 1000,
                    timeout: {
                      milliseconds: minutesToMilliseconds(3),
                      message: t("trade:xc.swap.approve.timeout"),
                    },
                  },
                )
              },
            },
            {
              tx: swapAndBridge,
              stepTitle: t("swap"),
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
