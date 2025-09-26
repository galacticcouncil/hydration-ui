import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useQuery } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import * as z from "zod/v4"

import { otcExistentialDepositorMultiplierQuery } from "@/api/otc"
import i18n from "@/i18n"
import { TAsset } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import {
  positiveOptional,
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
      offerAmount: positiveOptional,
      buyAsset: requiredObject<TAsset>(),
      buyAmount: positiveOptional,
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

  return useForm<PlaceOrderFormValues>({
    defaultValues,
    resolver: standardSchemaResolver(useSchema()),
    mode: "onChange",
  })
}
