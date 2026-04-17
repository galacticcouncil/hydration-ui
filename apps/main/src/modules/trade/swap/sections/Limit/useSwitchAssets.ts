import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import Big from "big.js"
import { useFormContext } from "react-hook-form"

import { LimitFormValues } from "@/modules/trade/swap/sections/Limit/useLimitForm"

export const useSwitchAssets = () => {
  const navigate = useNavigate()
  const { reset, getValues, trigger } = useFormContext<LimitFormValues>()

  return useMutation({
    mutationFn: async () => {
      const values = getValues()
      const { sellAsset, buyAsset, limitPrice } = values

      // Invert the limit price when switching assets
      let newPrice = ""
      if (limitPrice) {
        try {
          const priceBig = new Big(limitPrice)
          if (priceBig.gt(0)) {
            newPrice = Big(1).div(priceBig).toString()
          }
        } catch {
          // ignore invalid price
        }
      }

      // Recalculate buy amount with new price
      let newBuyAmount = ""
      if (values.sellAmount && newPrice) {
        try {
          newBuyAmount = new Big(values.sellAmount).times(newPrice).toString()
        } catch {
          // ignore
        }
      }

      reset({
        ...values,
        sellAsset: buyAsset,
        buyAsset: sellAsset,
        sellAmount: "",
        buyAmount: newBuyAmount,
        limitPrice: newPrice,
      })

      trigger()

      navigate({
        to: ".",
        search: (search) => ({
          ...search,
          assetIn: buyAsset?.id,
          assetOut: sellAsset?.id,
        }),
        resetScroll: false,
      })
    },
  })
}
