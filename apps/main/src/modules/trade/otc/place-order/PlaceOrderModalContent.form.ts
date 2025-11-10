import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useQuery } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import * as z from "zod/v4"

import { otcExistentialDepositorMultiplierQuery } from "@/api/otc"
import i18n from "@/i18n"
import { TAsset } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import {
  positive,
  positiveOptional,
  required,
  requiredObject,
  useValidateFormMaxBalance,
  validateFormExistentialDeposit,
} from "@/utils/validators"

export const marketPriceOptions = [-3, -1, 0, 3, 5, 10] as const

const useSchema = () => {
  const rpc = useRpcProvider()
  const { data: existentialDepositMultiplier } = useQuery(
    otcExistentialDepositorMultiplierQuery(rpc),
  )

  const refineFormMaxBalance = useValidateFormMaxBalance()

  return z
    .object({
      offerAsset: requiredObject<TAsset>(),
      offerAmount: positiveOptional,
      buyAsset: requiredObject<TAsset>(),
      buyAmount: positiveOptional,
      priceSettings: z.discriminatedUnion("type", [
        z.object({
          type: z.literal("relative"),
          percentage: z.literal(marketPriceOptions),
        }),
        z.object({
          type: z.literal("fixed"),
          value: required.pipe(positive),
          inputValue: z.string(),
          wasPriceSwitched: z.boolean(),
        }),
      ]),
      priceConfirmation: z
        .object({
          confirmed: z.boolean(),
        })
        .nullable(),
      isPriceSwitched: z.boolean(),
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
export type PriceSettings = PlaceOrderFormValues["priceSettings"]

export const usePlaceOrderForm = () => {
  const defaultValues: PlaceOrderFormValues = {
    offerAsset: null,
    offerAmount: "",
    buyAsset: null,
    buyAmount: "",
    priceSettings: {
      type: "relative",
      percentage: 0,
    },
    priceConfirmation: null,
    isPriceSwitched: false,
    isPartiallyFillable: true,
  }

  return useForm<PlaceOrderFormValues>({
    defaultValues,
    resolver: standardSchemaResolver(useSchema()),
    mode: "onChange",
  })
}
