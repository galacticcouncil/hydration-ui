import { zodResolver } from "@hookform/resolvers/zod"
import Big from "big.js"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { type infer as Infer, object } from "zod"

import { OtcOfferTabular } from "@/modules/trade/otc/table/OtcTable.columns"
import { nonZeroAmount } from "@/utils/validators"

export const fillOrderSchema = object({
  sellAmount: nonZeroAmount,
  buyAmount: nonZeroAmount,
})

export type FillOrderFormValues = Infer<typeof fillOrderSchema>

export const useFillOrderForm = (otcOffer: OtcOfferTabular) => {
  const defaultValues: FillOrderFormValues = otcOffer.isPartiallyFillable
    ? {
        sellAmount: "0",
        buyAmount: "0",
      }
    : {
        sellAmount: otcOffer.assetAmountIn,
        buyAmount: otcOffer.assetAmountOut,
      }

  const form = useForm<FillOrderFormValues>({
    defaultValues,
    resolver: zodResolver(fillOrderSchema),
    mode: "onChange",
  })

  const { watch, setValue } = form

  useEffect(() => {
    const subscription = watch(({ buyAmount, sellAmount }, { name, type }) => {
      if (type === "change" && name === "buyAmount") {
        const percentage = new Big(buyAmount || "0").div(
          otcOffer.assetAmountOut,
        )
        const newSellAmount = percentage
          .times(otcOffer.assetAmountIn)
          .toString()

        setValue("sellAmount", newSellAmount)
      } else if (type === "change" && name === "sellAmount") {
        const percentage = new Big(sellAmount || "0").div(
          otcOffer.assetAmountIn,
        )
        const newBuyAmount = percentage
          .times(otcOffer.assetAmountOut)
          .toString()

        setValue("buyAmount", newBuyAmount)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [otcOffer, watch, setValue])

  return form
}
