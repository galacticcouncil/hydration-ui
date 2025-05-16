import { HYDRADX_SS58_PREFIX } from "@galacticcouncil/sdk"
import { useAccount } from "@galacticcouncil/web3-connect"
import { safeConvertAddressSS58 } from "@galacticcouncil/web3-connect/src/utils/safeConvertAddressSS58"
import { useMutation } from "@tanstack/react-query"
import { formatDistanceToNow } from "date-fns"
import { useTranslation } from "react-i18next"

import { TwapOrder } from "@/api/utils/twapApi"
import { MarketFormValues } from "@/modules/trade/swap/sections/Market/useMarketForm"
import { useTradeSettings } from "@/states/tradeSettings"
import { useTransactionsStore } from "@/states/transactions"

export const useSubmitTwap = () => {
  const { t } = useTranslation(["common", "trade"])
  const { createTransaction } = useTransactionsStore()
  const { maxRetries } = useTradeSettings()

  const { account } = useAccount()
  // TODO ??
  const address = account
    ? safeConvertAddressSS58(account.address, HYDRADX_SS58_PREFIX)
    : null

  return useMutation({
    mutationFn: async ([values, twap]: [
      MarketFormValues,
      TwapOrder,
    ]): Promise<void> => {
      const { sellAsset } = values

      if (!sellAsset || !address) {
        return
      }

      const { amountIn, amountInPerTrade, reps, time } = twap.toHuman()

      const params = {
        noOfTrades: reps,
        in: t("currency", {
          value: amountInPerTrade,
          symbol: sellAsset.symbol,
        }),
        timeframe: formatDistanceToNow(Date.now() + time),
        inTotal: t("currency", {
          value: amountIn,
          symbol: sellAsset.symbol,
        }),
      }

      await createTransaction({
        tx: twap.toTx(address, maxRetries),
        toasts: {
          submitted: t("trade:market.submit.twap.processing", params),
          success: t("trade:market.submit.twap.success", params),
          error: t("trade:market.submit.twap.error", params),
        },
      })
    },
  })
}
