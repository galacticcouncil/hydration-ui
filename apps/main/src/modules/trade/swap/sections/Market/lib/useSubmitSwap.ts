import { Trade } from "@galacticcouncil/sdk-next/build/types/sor"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { toLowerCase } from "remeda"

import {
  MarketFormValues,
  TradeType,
} from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"
import { useTransactionsStore } from "@/states/transactions"
import { scaleHuman } from "@/utils/formatting"

export const useSubmitSwap = () => {
  const { t } = useTranslation(["common", "trade"])
  const { sdk } = useRpcProvider()
  const {
    single: { swapSlippage },
  } = useTradeSettings()

  const { account } = useAccount()
  const address = account?.address ?? ""

  const { createTransaction } = useTransactionsStore()

  return useMutation({
    mutationFn: async ([values, swap]: [
      MarketFormValues,
      Trade,
    ]): Promise<void> => {
      const { sellAsset, buyAsset } = values
      const { amountIn, amountOut, type } = swap

      if (!sellAsset || !buyAsset || !address) {
        return
      }

      const params =
        type === TradeType.Sell
          ? {
              in: t("currency", {
                value: scaleHuman(amountIn, sellAsset.decimals),
                symbol: sellAsset.symbol,
              }),
              out: t("currency", {
                value: scaleHuman(amountOut, buyAsset.decimals),
                symbol: buyAsset.symbol,
              }),
            }
          : {
              in: t("currency", {
                value: scaleHuman(amountOut, buyAsset.decimals),
                symbol: buyAsset.symbol,
              }),
              out: t("currency", {
                value: scaleHuman(amountIn, sellAsset.decimals),
                symbol: sellAsset.symbol,
              }),
            }

      const tx = await sdk.tx
        .trade(swap)
        .withSlippage(Number(swapSlippage))
        .withBeneficiary(address)
        .build()

      await createTransaction({
        tx: tx.get(),
        toasts: {
          submitted: t(
            `trade:market.swap.${toLowerCase(type)}.loading`,
            params,
          ),
          success: t(`trade:market.swap.${toLowerCase(type)}.success`, params),
          error: t(`trade:market.swap.${toLowerCase(type)}.error`, params),
        },
      })
    },
  })
}
