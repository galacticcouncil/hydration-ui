import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod/v4"

import { otcExistentialDepositorMultiplierQuery } from "@/api/otc"
import i18n from "@/i18n"
import { TAsset } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import {
  positive,
  required,
  requiredObject,
  useValidateFormMaxBalance,
  validateFormExistentialDeposit,
} from "@/utils/validators"

const useSchema = () => {
  const rpc = useRpcProvider()
  const { data: existentialDepositMultiplier } = useQuery(
    otcExistentialDepositorMultiplierQuery(rpc),
  )

  const refineFormMaxBalance = useValidateFormMaxBalance()

  return z
    .object({
      offerAsset: requiredObject<TAsset>(),
      offerAmount: required.pipe(positive),
      buyAsset: requiredObject<TAsset>(),
      buyAmount: required.pipe(positive),
      price: z.string(),
      isPartiallyFillable: z.boolean(),
    })
    .check(
      z.refine(
        ({ offerAsset, buyAsset }) =>
          !offerAsset || !buyAsset || offerAsset.id !== buyAsset.id,
        {
          error: i18n.t("trade:otc.placeOrder.validation.sameAssets"),
          path: ["buyAsset"],
        },
      ),
      validateFormExistentialDeposit("offerAmount", (form) => [
        existentialDepositMultiplier,
        form.offerAsset,
        form.offerAmount,
      ]),
      refineFormMaxBalance("offerAmount", (form) => [
        form.offerAsset,
        form.offerAmount,
      ]),
      validateFormExistentialDeposit("buyAmount", (form) => [
        existentialDepositMultiplier,
        form.buyAsset,
        form.buyAmount,
      ]),
    )
}

export type PlaceOrderFormValues = z.infer<ReturnType<typeof useSchema>>

export const usePlaceOrderForm = () => {
  const defaultValues: PlaceOrderFormValues = {
    offerAsset: null,
    offerAmount: "",
    buyAsset: null,
    buyAmount: "",
    price: "",
    isPartiallyFillable: true,
  }

  const form = useForm<PlaceOrderFormValues>({
    defaultValues,
    resolver: standardSchemaResolver(useSchema()),
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
