import { useAccount } from "@galacticcouncil/web3-connect"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod/v4"

import { TAssetData } from "@/api/assets"
import { TradeType } from "@/api/trade"
import i18n from "@/i18n"
import {
  XcAsset,
  XcChain,
} from "@/modules/trade/swap/sections/XcSwap/data/mock"
import { useAccountBalances } from "@/states/account"
import {
  positiveOptional,
  requiredObject,
  useValidateFormMaxBalance,
} from "@/utils/validators"

const schema = z
  .object({
    srcChain: requiredObject<XcChain>(),
    sellAsset: requiredObject<TAssetData>(),
    sellAmount: positiveOptional,
    destChain: requiredObject<XcChain>(),
    buyAsset: requiredObject<XcAsset>(),
    buyAmount: positiveOptional,
    type: z.custom<TradeType>(),
    destAddress: z.string(),
    isSingleTrade: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const isCrossChain = data.destChain?.platform !== "hydration"

    if (isCrossChain) {
      if (!data.destAddress.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["destAddress"],
          message: i18n.t("error.required"),
        })
      } else if (
        data.destChain &&
        !data.destChain.addressValidator(data.destAddress)
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["destAddress"],
          message: i18n.t("trade:xc.swap.error.destAddressInvalid"),
        })
      }
    }
  })

const useSchema = () => {
  const { account } = useAccount()
  const refineMaxBalance = useValidateFormMaxBalance()

  if (!account) {
    return schema
  }

  return schema.check(
    refineMaxBalance("sellAmount", (form) => [form.sellAsset, form.sellAmount]),
  )
}

export type XcSwapFormValues = z.infer<ReturnType<typeof useSchema>>

export const useXcSwapForm = () => {
  const { account } = useAccount()
  const { isBalanceLoaded, isBalanceLoading } = useAccountBalances()

  const defaultValues: XcSwapFormValues = {
    srcChain: null,
    sellAsset: null,
    sellAmount: "",
    destChain: null,
    buyAsset: null,
    buyAmount: "",
    type: TradeType.Sell,
    destAddress: "",
    isSingleTrade: true,
  }

  const form = useForm<XcSwapFormValues>({
    defaultValues,
    mode: "onChange",
    resolver: standardSchemaResolver(useSchema()),
  })

  const { trigger, getValues, getFieldState } = form
  useEffect(() => {
    const { sellAsset } = getValues()

    if (!account || !sellAsset) {
      return
    }

    if (isBalanceLoaded(sellAsset.id) || !isBalanceLoading) {
      const sellAmountState = getFieldState("sellAmount")

      if (!sellAmountState.isDirty && !sellAmountState.isTouched) {
        return
      }

      trigger("sellAmount")
    }
  }, [
    account,
    isBalanceLoading,
    trigger,
    getValues,
    getFieldState,
    isBalanceLoaded,
  ])

  return form
}
