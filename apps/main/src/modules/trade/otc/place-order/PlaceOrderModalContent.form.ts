import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import i18n from "@/i18n"
import { otcExistentialDepositorMultiplierQuery } from "@/modules/trade/otc/useOtcExistentialDepositorMultiplier"
import { TAsset, useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import {
  maxBalance,
  required,
  validateExistentialDeposit,
} from "@/utils/validators"

const getSchema = (
  offerAmountBalance: string,
  existentialDepositMultiplier: number | undefined,
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
    .superRefine(({ offerAssetId, buyAssetId }, ctx) => {
      if (!offerAssetId || !buyAssetId || offerAssetId == buyAssetId) {
        ctx.addIssue({
          code: "custom",
          message: i18n.t("trade:otc.placeOrder.validation.sameAssets"),
          path: ["buyAssetId" satisfies keyof PlaceOrderFormValues],
        })
      }
    })
    .superRefine(({ offerAssetId, offerAmount }, ctx) => {
      const errorMessage = validateExistentialDeposit(
        getAsset(offerAssetId ?? ""),
        offerAmount || "0",
        existentialDepositMultiplier,
      )

      if (errorMessage) {
        ctx.addIssue({
          code: "custom",
          message: errorMessage,
          path: ["offerAmount" satisfies keyof PlaceOrderFormValues],
        })
      }
    })
    .superRefine(({ buyAssetId, buyAmount }, ctx) => {
      const errorMessage = validateExistentialDeposit(
        getAsset(buyAssetId ?? ""),
        buyAmount || "0",
        existentialDepositMultiplier,
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
  const rpc = useRpcProvider()

  const { getAsset } = useAssets()
  const { data: existentialDepositMultiplier } = useQuery(
    otcExistentialDepositorMultiplierQuery(rpc),
  )

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
            setValue("buyAmount", buyAmount.toString(), {
              shouldValidate: true,
            })
          } else if (buyAmountBn.gt(0)) {
            const offerAmount = buyAmountBn.div(priceBn)
            setValue("offerAmount", offerAmount.toString(), {
              shouldValidate: true,
            })
          }
        } else if (name === "offerAmount" || name === "buyAmount") {
          if (offerAmountBn.gt(0) && buyAmountBn.gt(0)) {
            const price = buyAmountBn.div(offerAmountBn)
            setValue("price", price.toString(), { shouldValidate: true })
          } else if (buyAmountBn.gt(0) && priceBn.gt(0)) {
            const offerAmount = buyAmountBn.div(priceBn)
            setValue("offerAmount", offerAmount.toString(), {
              shouldValidate: true,
            })
          } else if (offerAmountBn.gt(0) && priceBn.gt(0)) {
            const buyAmount = offerAmountBn.mul(priceBn)
            setValue("buyAmount", buyAmount.toString(), {
              shouldValidate: true,
            })
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
