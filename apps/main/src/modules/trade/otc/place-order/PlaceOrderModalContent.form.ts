import { zodResolver } from "@hookform/resolvers/zod"
import Big from "big.js"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import i18n from "@/i18n"
import { useOtcExistentialDepositorMultiplier } from "@/modules/trade/otc/useOtcExistentialDepositorMultiplier"
import { TAsset, useAssets } from "@/providers/assetsProvider"
import {
  maxBalance,
  required,
  validateExistentialDeposit,
} from "@/utils/validators"

const getSchema = (
  offerAmountBalance: string,
  existentialDepositMultiplier: Promise<number> | undefined,
  getAsset: (id: string) => TAsset | undefined,
) =>
  z
    .object({
      offerAssetId: required,
      offerAmount: required.pipe(maxBalance(offerAmountBalance)),
      buyAssetId: required,
      buyAmount: required,
      price: z.string(),
      isPartiallyFillable: z.boolean(),
    })
    .superRefine(async ({ offerAssetId, buyAssetId }, ctx) => {
      if (!offerAssetId || !buyAssetId || offerAssetId == buyAssetId) {
        ctx.addIssue({
          code: "custom",
          message: i18n.t("trade:otc.placeOrder.validation.sameAssets"),
          path: ["buyAssetId" satisfies keyof PlaceOrderFormValues],
        })
      }
    })
    .superRefine(async ({ offerAssetId, offerAmount }, ctx) => {
      const errorMessage = validateExistentialDeposit(
        getAsset(offerAssetId ?? ""),
        offerAmount || "0",
        await existentialDepositMultiplier,
      )

      if (errorMessage) {
        ctx.addIssue({
          code: "custom",
          message: errorMessage,
          path: ["offerAmount" satisfies keyof PlaceOrderFormValues],
        })
      }
    })
    .superRefine(async ({ buyAssetId, buyAmount }, ctx) => {
      const errorMessage = validateExistentialDeposit(
        getAsset(buyAssetId ?? ""),
        buyAmount || "0",
        await existentialDepositMultiplier,
      )

      if (errorMessage) {
        ctx.addIssue({
          code: "custom",
          message: errorMessage,
          path: ["buyAmount" satisfies keyof PlaceOrderFormValues],
        })
      }
    })

export type PlaceOrderFormValues = z.infer<ReturnType<typeof getSchema>>

export const usePlaceOrderForm = (offerAmountBalance: string) => {
  const { getAsset } = useAssets()
  const existentialDepositMultiplier = useOtcExistentialDepositorMultiplier()

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
    resolver: zodResolver(
      getSchema(offerAmountBalance, existentialDepositMultiplier, getAsset),
      {
        async: true,
      },
    ),
    mode: "onChange",
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
