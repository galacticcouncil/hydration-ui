import { zodResolver } from "@hookform/resolvers/zod"
import Big from "big.js"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

export const placeOrderSchema = z.object({
  offerAssetId: z.string(),
  offerAmount: z.string(),
  buyAssetId: z.string(),
  buyAmount: z.string(),
  price: z.string(),
  isPartiallyFillable: z.boolean(),
})

export type PlaceOrderFormValues = z.infer<typeof placeOrderSchema>

export const usePlaceOrderForm = () => {
  const defaultValues: PlaceOrderFormValues = {
    offerAssetId: "",
    offerAmount: "",
    buyAssetId: "",
    buyAmount: "",
    price: "",
    isPartiallyFillable: true,
  }

  const form = useForm<PlaceOrderFormValues>({
    defaultValues,
    resolver: zodResolver(placeOrderSchema),
  })

  const { watch, setValue } = form

  useEffect(() => {
    const subscription = watch(
      ({ offerAmount, buyAmount, price }, { type, name }) => {
        if (type !== "change") {
          return
        }

        const priceBn = new Big(price || "0")
        const offerAmountBn = new Big(offerAmount || "0")
        const buyAmountBn = new Big(buyAmount || "0")

        if (name === "price" && priceBn.gt(0)) {
          if (offerAmountBn.gt(0)) {
            const buyAmount = offerAmountBn.mul(priceBn)
            setValue("buyAmount", buyAmount.toString())
          } else if (buyAmountBn.gt(0)) {
            const offerAmount = buyAmountBn.div(priceBn)
            setValue("offerAmount", offerAmount.toString())
          }
        } else if (name === "offerAmount" || name === "buyAmount") {
          if (offerAmountBn.gt(0) && buyAmountBn.gt(0)) {
            const price = buyAmountBn.div(offerAmountBn)
            setValue("price", price.toString())
          } else if (buyAmountBn.gt(0) && priceBn.gt(0)) {
            const offerAmount = buyAmountBn.div(priceBn)
            setValue("offerAmount", offerAmount.toString())
          } else if (offerAmountBn.gt(0) && priceBn.gt(0)) {
            const buyAmount = offerAmountBn.mul(priceBn)
            setValue("buyAmount", buyAmount.toString())
          }
        }
      },
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [watch, setValue])

  return form
}
