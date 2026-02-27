import { getTimeFrameMillis } from "@galacticcouncil/main/src/components/TimeFrame/TimeFrame.utils"
import { TradeDcaOrder } from "@galacticcouncil/sdk-next/build/types/sor"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import {
  DcaFormValues,
  DcaOrdersMode,
} from "@/modules/trade/swap/sections/DCA/useDcaForm"
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

      return createTransaction({
        tx: orderTx,
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
      })
    },
  })
}
