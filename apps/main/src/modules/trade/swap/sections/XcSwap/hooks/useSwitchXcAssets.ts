import { useCallback } from "react"
import { useFormContext } from "react-hook-form"

import { XcSwapFormValues } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapForm"

export const useSwitchXcAssets = () => {
  const { getValues, reset } = useFormContext<XcSwapFormValues>()

  return useCallback(() => {
    const values = getValues()

    reset({
      ...values,
      srcAsset: values.destAsset,
      srcAmount: values.destAmount,
      destAsset: values.srcAsset,
      destAmount: values.srcAmount,
    })
  }, [getValues, reset])
}
