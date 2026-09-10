import Big from "big.js"
import { useCallback } from "react"
import { useFormContext, UseFormReturn } from "react-hook-form"

import { TradeType } from "@/api/trade"
import { XcSwapFormValues } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapForm"
import { validateMaxBalance } from "@/utils/validators"

type ResetOptions = {
  readonly clearDestAddress?: boolean
}

export const shouldResetXcSwapFormAfterSubmit = (
  sellAmount: string,
  maxSellBalance: string,
): boolean => {
  if (!sellAmount) {
    return true
  }

  const futureMaxSellBalance = Big(maxSellBalance || "0").minus(sellAmount)

  return !validateMaxBalance(futureMaxSellBalance.toString(), sellAmount)
}

export const resetXcSwapForm = (
  form: UseFormReturn<XcSwapFormValues>,
  { clearDestAddress = false }: ResetOptions = {},
) => {
  const values = form.getValues()

  form.reset({
    ...values,
    sellAmount: "",
    buyAmount: "",
    type: TradeType.Sell,
    isSingleTrade: true,
    destAddress: clearDestAddress ? "" : values.destAddress,
  })
  form.clearErrors()
}

export const useXcSwapFormReset = () => {
  const form = useFormContext<XcSwapFormValues>()

  return useCallback(
    (options?: ResetOptions) => resetXcSwapForm(form, options),
    [form],
  )
}
