import { useAccount } from "@galacticcouncil/web3-connect"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { isNumber } from "remeda"
import * as z from "zod/v4"

import i18n from "@/i18n"
import {
  XcAsset,
  XcChain,
} from "@/modules/trade/swap/sections/XcSwap/data/mock"
import { useAssets } from "@/providers/assetsProvider"
import { useAccountBalances } from "@/states/account"
import {
  positive,
  required,
  requiredObject,
  useValidateFormMaxBalance,
} from "@/utils/validators"

const schema = z
  .object({
    srcChain: requiredObject<XcChain>(),
    srcAsset: requiredObject<XcAsset>(),
    srcAmount: required.pipe(positive),
    destChain: requiredObject<XcChain>(),
    destAsset: requiredObject<XcAsset>(),
    destAmount: required.pipe(positive),
    destAddress: z.string(),
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
          message: "Invalid destination address",
        })
      }
    } else if (data.srcAsset && data.destAsset) {
      if (data.srcAsset.id === data.destAsset.id) {
        ctx.addIssue({
          code: "custom",
          path: ["destAsset"],
          message: "Select a different asset",
        })
      }
    }
  })

const useSchema = () => {
  const { account } = useAccount()
  const { getAsset } = useAssets()
  const refineMaxBalance = useValidateFormMaxBalance()

  if (!account) {
    return schema
  }

  return schema.check(
    refineMaxBalance("srcAmount", (form) => {
      const xcAsset = form.srcAsset
      const asset = isNumber(xcAsset?.id)
        ? (getAsset(xcAsset.id) ?? null)
        : null

      return [asset, form.srcAmount]
    }),
  )
}

export type XcSwapFormValues = z.infer<typeof schema>

export const useXcSwapForm = () => {
  const { account } = useAccount()
  const { isBalanceLoaded, isBalanceLoading } = useAccountBalances()

  const defaultValues: XcSwapFormValues = {
    srcChain: null,
    srcAsset: null,
    srcAmount: "",
    destChain: null,
    destAsset: null,
    destAmount: "",
    destAddress: "",
  }

  const form = useForm<XcSwapFormValues>({
    defaultValues,
    mode: "onChange",
    resolver: standardSchemaResolver(useSchema()),
  })

  const { trigger, getValues, getFieldState } = form
  useEffect(() => {
    const { srcAsset } = getValues()

    if (!account || !isNumber(srcAsset?.id)) {
      return
    }

    if (isBalanceLoaded(String(srcAsset.id)) || !isBalanceLoading) {
      const srcAmountState = getFieldState("srcAmount")

      if (!srcAmountState.isDirty && !srcAmountState.isTouched) {
        return
      }

      trigger("srcAmount")
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
