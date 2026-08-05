import { useCallback } from "react"
import { useFormContext } from "react-hook-form"

import { TradeType } from "@/api/trade"
import { XcSwapFormValues } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapForm"

type ResetOptions = {
  readonly clearDestAddress?: boolean
}

export const useXcSwapFormReset = () => {
  const { getValues, reset } = useFormContext<XcSwapFormValues>()

  return useCallback(
    ({ clearDestAddress = false }: ResetOptions = {}) => {
      const values = getValues()

      reset({
        ...values,
        sellAmount: "",
        buyAmount: "",
        type: TradeType.Sell,
        isSingleTrade: true,
        destAddress: clearDestAddress ? "" : values.destAddress,
      })
    },
    [getValues, reset],
  )
}
