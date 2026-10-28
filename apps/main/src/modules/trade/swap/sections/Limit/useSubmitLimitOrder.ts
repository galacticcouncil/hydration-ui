import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { getIntentDeadline } from "@/api/intents"
import { ORDER_MATCH_WINDOW_MS } from "@/modules/trade/swap/lib/orderMatch"
import {
  EXPIRY_MS,
  LimitFormValues,
} from "@/modules/trade/swap/sections/Limit/useLimitForm"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"
import { scale } from "@/utils/formatting"

export const useSubmitLimitOrder = () => {
  const { t } = useTranslation(["common", "trade"])
  const { account } = useAccount()

  const rpc = useRpcProvider()
  const { sdk } = rpc

  const createTransaction = useTransactionsStore((s) => s.createTransaction)

  return useMutation({
    mutationFn: async (values: LimitFormValues) => {
      const {
        sellAsset,
        sellAmount,
        buyAsset,
        buyAmount,
        expiry,
        partiallyFillable,
        isOrderMatch,
      } = values

      if (!sellAsset || !buyAsset) throw new Error("Invalid intent assets")
      if (!account) throw new Error("Account not connected")

      const amountOutRaw = BigInt(scale(buyAmount || "0", buyAsset.decimals))

      if (amountOutRaw <= 0n) throw new Error("Invalid min amount out")

      const trade = await sdk.api.router.getBestSell(
        Number(sellAsset.id),
        Number(buyAsset.id),
        BigInt(scale(sellAmount || "0", sellAsset.decimals)),
      )

      const txBuilder = sdk.tx
        .intentLimit(trade)
        .withBeneficiary(account.address)
        .withMinAmountOut(amountOutRaw)
        .withPartial(partiallyFillable)

      const expiryMs = EXPIRY_MS[expiry]

      if (expiryMs) {
        txBuilder.withDeadline(await getIntentDeadline(rpc, expiryMs))
      }

      // The shortest expiry (15min) still ends well after the match window
      if (isOrderMatch) {
        txBuilder.withMatchWindow(BigInt(ORDER_MATCH_WINDOW_MS))
      }

      const tx = await txBuilder.build()

      const params = {
        in: t("currency", { value: sellAmount, symbol: sellAsset.symbol }),
        out: t("currency", { value: buyAmount, symbol: buyAsset.symbol }),
      }

      return createTransaction({
        tx: tx.get(),
        toasts: {
          submitted: t("trade:intent.limit.loading", params),
          success: t("trade:intent.limit.placed", params),
          error: t("trade:intent.limit.error", params),
        },
      })
    },
  })
}
