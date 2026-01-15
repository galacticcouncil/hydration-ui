import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useFormContext } from "react-hook-form"

import { DcaFormValues } from "@/modules/trade/swap/sections/DCA/useDcaForm"

export const useSwitchAssets = () => {
  const navigate = useNavigate()

  const { reset, getValues, trigger } = useFormContext<DcaFormValues>()

  return useMutation({
    mutationFn: async () => {
      const values = getValues()

      reset({
        ...values,
        buyAsset: values.sellAsset,
        sellAsset: values.buyAsset,
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
