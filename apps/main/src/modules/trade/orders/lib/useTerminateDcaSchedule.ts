import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"

export const useTerminateDcaSchedule = () => {
  const { t } = useTranslation("trade")
  const { papi } = useRpcProvider()
  const { createTransaction } = useTransactionsStore()

  return useMutation({
    mutationFn: (scheduleId: number) => {
      const tx = papi.tx.DCA.terminate({
        schedule_id: scheduleId,
        next_execution_block: undefined,
      })

      return createTransaction({
        tx,
        toasts: {
          success: t("trade.cancelDcaOrder.success"),
          submitted: t("trade.cancelDcaOrder.loading"),
          error: t("trade.cancelDcaOrder.error"),
        },
      })
    },
  })
}
