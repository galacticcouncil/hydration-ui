import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useFormContext } from "react-hook-form"

import { LimitFormValues } from "@/modules/trade/swap/sections/Limit/useLimitForm"

export const useSwitchAssets = () => {
  const navigate = useNavigate()
  const { reset, getValues, trigger } = useFormContext<LimitFormValues>()

  return useMutation({
    mutationFn: async () => {
      const values = getValues()

      reset({
        ...values,
        buyAsset: values.sellAsset,
        sellAsset: values.buyAsset,
        sellAmount: "",
        buyAmount: "",
        limitPrice: "",
      })

      trigger()

      navigate({
        to: ".",
        search: (search) => ({
          ...search,
          assetIn: values.buyAsset?.id,
          assetOut: values.sellAsset?.id,
        }),
        resetScroll: false,
      })
    },
  })
}
