import { useQuery } from "@tanstack/react-query"
import { UseFormReturn } from "react-hook-form"

import { dcaTradeOrderQuery } from "@/api/trade"
import { getPeriodDuration } from "@/components/PeriodInput/PeriodInput.utils"
import { DcaFormValues } from "@/modules/trade/swap/sections/DCA/useDcaForm"
import { useRpcProvider } from "@/providers/rpcProvider"

export const useDcaTradeOrder = (form: UseFormReturn<DcaFormValues>) => {
  const rpc = useRpcProvider()

  const [sellAsset, buyAsset, sellAmount, period] = form.watch([
    "sellAsset",
    "buyAsset",
    "sellAmount",
    "period",
  ])

  return useQuery(
    dcaTradeOrderQuery(rpc, {
      assetIn: sellAsset?.id ?? "",
      assetOut: buyAsset?.id ?? "",
      amountIn: sellAmount,
      duration: getPeriodDuration(period),
    }),
  )
}
