import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import * as z from "zod"

import { minBudgetNativeQuery } from "@/api/constants"
import { periodInputSchema } from "@/components"
import { exchangeNative } from "@/modules/trade/sections/DCA/DCA"
import { TAsset, useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAssetPrice } from "@/states/displayAsset"
import { NATIVE_ASSET_ID } from "@/utils/consts"
import { scaleHuman } from "@/utils/formatting"
import { required, requiredAny } from "@/utils/validators"

const useSchema = () => {
  const { t } = useTranslation()
  const { price, isValid } = useAssetPrice(NATIVE_ASSET_ID)

  const { data: minBudgetNative } = useQuery(
    minBudgetNativeQuery(useRpcProvider()),
  )

  return z
    .object({
      sellAsset: z.custom<TAsset | null>().refine(...requiredAny),
      sellAmount: required,
      buyAsset: z.custom<TAsset | null>().refine(...requiredAny),
      buyAmount: z.string(),
      interval: periodInputSchema,
      advancedSettings: z.boolean(),
      maxRetries: z.number(),
    })
    .superRefine(({ sellAsset, sellAmount }, ctx) => {
      if (!sellAsset || !sellAmount || !minBudgetNative || !isValid) {
        return
      }

      const amountInMin = exchangeNative(price, sellAsset, minBudgetNative)

      const amountInMInScaled = scaleHuman(amountInMin, sellAsset.decimals)

      if (Big(amountInMInScaled).gt(sellAmount)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("error.minBudgetTooLow", {
            amount: amountInMInScaled,
            asset: sellAsset.symbol,
          }),
          path: ["sellAmount" satisfies keyof DCAFormValues],
        })
      }
    })
}

export type DCAFormValues = z.infer<ReturnType<typeof useSchema>>

export const useDCAForm = () => {
  const { getAssetWithFallback } = useAssets()

  const defaultValues: DCAFormValues = {
    // sellAsset: null,
    sellAsset: getAssetWithFallback("10"),
    sellAmount: "5",
    // buyAsset: null,
    buyAsset: getAssetWithFallback("5"),
    buyAmount: "5",
    interval: {
      // value: 0,
      value: 1,
      type: "hour",
    },
    advancedSettings: false,
    maxRetries: 0,
  }

  const form = useForm<DCAFormValues>({
    mode: "onChange",
    defaultValues,
    resolver: zodResolver(useSchema()),
  })

  const { watch, setValue } = form
  useEffect(() => {
    const subscription = watch(({ sellAmount, buyAmount }, { name, type }) => {
      if (type === "change" && name === "sellAmount") {
        setValue("buyAmount", sellAmount ?? "")
      } else if (type === "change" && name === "buyAmount") {
        setValue("sellAmount", buyAmount ?? "")
      }
    })

    return () => subscription.unsubscribe()
  }, [watch, setValue])

  return form
}
