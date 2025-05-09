import { useQuery } from "@tanstack/react-query"
import { UseFormReturn } from "react-hook-form"

import { dcaTradeOrderQuery } from "@/api/trade"
import { INTERVAL_DCA_MS } from "@/components/PeriodInput/PeriodInput.utils"
import { DcaFormValues } from "@/modules/trade/sections/DCA/useDcaForm"
import { useRpcProvider } from "@/providers/rpcProvider"

export const useDcaTradeData = (form: UseFormReturn<DcaFormValues>) => {
  const rpc = useRpcProvider()

  const [sellAsset, buyAsset, sellAmount, interval] = form.watch([
    "sellAsset",
    "buyAsset",
    "sellAmount",
    "interval",
  ])

  return useQuery(
    dcaTradeOrderQuery(rpc, {
      assetIn: sellAsset?.id ?? "",
      assetOut: buyAsset?.id ?? "",
      amountIn: sellAmount,
      duration: interval.value * INTERVAL_DCA_MS[interval.type],
    }),
  )
}
