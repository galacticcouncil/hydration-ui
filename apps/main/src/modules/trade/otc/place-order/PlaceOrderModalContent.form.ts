import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useQuery } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import * as z from "zod/v4"

import { otcExistentialDepositorMultiplierQuery } from "@/api/otc"
import i18n from "@/i18n"
import {
  useFormMaxBalanceWithFee,
  ValidateFormMaxBalanceWithFee,
} from "@/modules/transactions/hooks/useFormMaxBalanceWithFee"
import { TAsset } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scale } from "@/utils/formatting"
import {
  positive,
  positiveOptional,
  required,
  requiredObject,
  validateFormExistentialDeposit,
} from "@/utils/validators"

export const marketPriceOptions = [-3, -1, 0, 3, 5, 10] as const

const view = z.literal(["offerPrice", "buyPrice"])

const placeOrderFormBaseSchema = z.object({
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
      offerPrice: required.pipe(positive),
      buyPrice: required.pipe(positive),
      view,
    }),
  ]),
  priceConfirmation: z
    .object({
      confirmed: z.boolean(),
    })
    .nullable(),
  view,
  isPartiallyFillable: z.boolean(),
})

export type PlaceOrderFormValues = z.infer<typeof placeOrderFormBaseSchema>
export type PriceSettings = PlaceOrderFormValues["priceSettings"]
export type PlaceOrderView = PlaceOrderFormValues["view"]

const useSchema = (validateBalance: ValidateFormMaxBalanceWithFee) => {
  const rpc = useRpcProvider()
  const { data: existentialDepositMultiplier } = useQuery(
    otcExistentialDepositorMultiplierQuery(rpc),
  )

  return placeOrderFormBaseSchema.check(
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
    validateBalance("offerAmount", (form) => [
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

export const usePlaceOrder = () => {
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
    view: "offerPrice",
    isPartiallyFillable: true,
  }

  const { papi } = useRpcProvider()

  const tx = papi.tx.OTC.place_order({
    amount_in: BigInt(scale(1, 12)),
    amount_out: BigInt(scale(1, 12)),
    asset_in: Number(0),
    asset_out: Number(10),
    partially_fillable: true,
  })

  const { validateBalance, getMaxBalance } = useFormMaxBalanceWithFee(tx)

  const form = useForm<PlaceOrderFormValues>({
    defaultValues,
    resolver: standardSchemaResolver(useSchema(validateBalance)),
    mode: "onChange",
  })

  return {
    form,
    getMaxBalance,
  }
}
