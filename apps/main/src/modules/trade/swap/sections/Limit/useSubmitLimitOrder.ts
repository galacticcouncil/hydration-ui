import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { LimitFormValues } from "@/modules/trade/swap/sections/Limit/useLimitForm"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"
import { scale } from "@/utils/formatting"

const EXPIRY_MS: Record<string, number> = {
  "1h": 1 * 60 * 60 * 1000,
  "12h": 12 * 60 * 60 * 1000,
  "24h": 23 * 60 * 60 * 1000 + 59 * 60 * 1000, // just under runtime's 24h max
}

export const useSubmitLimitOrder = () => {
  const { t } = useTranslation(["common", "trade"])
  const { account } = useAccount()

  const { papiClient } = useRpcProvider()

  const createTransaction = useTransactionsStore((s) => s.createTransaction)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: LimitFormValues) => {
      const { sellAsset, sellAmount, buyAsset, buyAmount, expiry } = values

      if (!sellAsset || !buyAsset || !account) {
        return
      }

      const formattedSell = t("currency", {
        value: sellAmount,
        symbol: sellAsset.symbol,
      })
      const formattedBuy = t("currency", {
        value: buyAmount,
        symbol: buyAsset.symbol,
      })

      const expiryMs = EXPIRY_MS[expiry]
      const deadline =
        expiryMs !== undefined ? BigInt(Date.now() + expiryMs) : undefined

      // Use unsafe API to bypass descriptor checksum validation
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unsafeApi = papiClient.getUnsafeApi() as any
      const tx = unsafeApi.tx.Intent.submit_intent({
        intent: {
          data: {
            type: "Swap",
            value: {
              asset_in: Number(sellAsset.id),
              asset_out: Number(buyAsset.id),
              amount_in: BigInt(scale(sellAmount || "0", sellAsset.decimals)),
              amount_out: BigInt(scale(buyAmount || "0", buyAsset.decimals)),
              partial: false,
            },
          },
          deadline,
          on_resolved: undefined,
        },
      })

      return createTransaction(
        {
          tx,
          toasts: {
            submitted: t("trade:limit.tx.submitted", {
              amountIn: formattedSell,
              amountOut: formattedBuy,
            }),
            success: t("trade:limit.tx.success", {
              amountIn: formattedSell,
              amountOut: formattedBuy,
            }),
            error: t("trade:limit.tx.error", {
              amountIn: formattedSell,
              amountOut: formattedBuy,
            }),
          },
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: ["intents", "byAccount", account?.address ?? ""],
            })
          },
        },
      )
    },
  })
}
