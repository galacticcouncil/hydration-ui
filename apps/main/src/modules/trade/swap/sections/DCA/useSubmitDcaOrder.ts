import { TradeDcaOrder } from "@galacticcouncil/sdk-next/build/types/sor"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { getPeriodDuration } from "@/components/PeriodInput/PeriodInput.utils"
import { DcaFormValues } from "@/modules/trade/swap/sections/DCA/useDcaForm"
import { AnyTransaction } from "@/modules/transactions/types"
import { useTransactionsStore } from "@/states/transactions"
import { scaleHuman } from "@/utils/formatting"

export const useSubmitDcaOrder = () => {
  const { t } = useTranslation(["common", "trade"])

  const { account } = useAccount()
  const address = account?.address

  const { createTransaction } = useTransactionsStore()

  return useMutation({
    mutationFn: async ([formValues, order, orderTx]: [
      DcaFormValues,
      TradeDcaOrder,
      AnyTransaction,
    ]) => {
      const { sellAsset, buyAsset, sellAmount } = formValues

      if (!sellAsset || !buyAsset || !address) {
        return
      }

      const sellDecimals = sellAsset.decimals
      const sellSymbol = sellAsset.symbol
      const buySymbol = buyAsset.symbol
      const frequency = getPeriodDuration(formValues.frequency)

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
        frequency,
      }

      return createTransaction({
        tx: orderTx,
        toasts: {
          submitted: t("trade:dca.tx.loading", params),
          success: t("trade:dca.tx.success", params),
          error: t("trade:dca.tx.error", params),
        },
      })
    },
  })
}
