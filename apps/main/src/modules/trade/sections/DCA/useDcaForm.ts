import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useQuery } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import * as z from "zod"

import { minBudgetNativeQuery } from "@/api/constants"
import { periodInputSchema } from "@/components/PeriodInput/PeriodInput"
import { TAsset, useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAssetPrice } from "@/states/displayAsset"
import { NATIVE_ASSET_ID } from "@/utils/consts"
import { positive, required, requiredObject } from "@/utils/validators"

const schema = z.object({
  sellAsset: requiredObject<TAsset>(),
  sellAmount: required.pipe(positive),
  buyAsset: requiredObject<TAsset>(),
  interval: periodInputSchema,
})

const useSchema = () => {
  const { t } = useTranslation()
  const { price, isValid } = useAssetPrice(NATIVE_ASSET_ID)

  const { data: minBudgetNative } = useQuery(
    minBudgetNativeQuery(useRpcProvider()),
  )

  return schema

  // return schema.superRefine(({ sellAsset, sellAmount }, ctx) => {
  //   if (!sellAsset || !sellAmount || !minBudgetNative || !isValid) {
  //     return
  //   }

  //   const amountInMin = exchangeNative(price, sellAsset, minBudgetNative)

  //   const amountInMInScaled = scaleHuman(amountInMin, sellAsset.decimals)

  //   if (Big(amountInMInScaled).gt(sellAmount)) {
  //     ctx.addIssue({
  //       code: z.ZodIssueCode.custom,
  //       message: t("error.minBudgetTooLow", {
  //         amount: amountInMInScaled,
  //         asset: sellAsset.symbol,
  //       }),
  //       path: ["sellAmount" satisfies keyof DcaFormValues],
  //     })
  //   }
  // })
}

export type DcaFormValues = z.infer<ReturnType<typeof useSchema>>

type Args = {
  readonly assetIn: string
  readonly assetOut: string
}

export const useDcaForm = ({ assetIn, assetOut }: Args) => {
  const { getAsset } = useAssets()

  const defaultValues: DcaFormValues = {
    sellAsset: getAsset(assetIn) ?? null,
    sellAmount: "",
    buyAsset: getAsset(assetOut) ?? null,
    interval: {
      value: 1,
      type: "hour",
    },
  }

  return useForm<DcaFormValues>({
    mode: "onChange",
    defaultValues,
    resolver: standardSchemaResolver(useSchema()),
  })
}
