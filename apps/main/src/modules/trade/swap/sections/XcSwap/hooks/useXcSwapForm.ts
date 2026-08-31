import { useAccount } from "@galacticcouncil/web3-connect"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod/v4"

import { TAssetData } from "@/api/assets"
import { useAccountBalances } from "@/api/balances"
import { TradeType } from "@/api/trade"
import i18n from "@/i18n"
import {
  getSharedSellAmount,
  useSharedSellAmountSync,
} from "@/modules/trade/swap/lib/useSharedSellAmount"
import { XcAsset, XcChain } from "@/modules/trade/swap/sections/XcSwap/types"
import {
  maxBalanceError,
  positiveOptional,
  requiredObject,
  validateMaxBalance,
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

const useSchema = (maxSwapSellBalance: string, maxTwapSellBalance: string) => {
  const { account } = useAccount()

  if (!account) {
    return schema
  }

  return schema.refine(
    (form) =>
      validateMaxBalance(
        form.isSingleTrade ? maxSwapSellBalance : maxTwapSellBalance,
        form.sellAmount,
      ),
    {
      error: maxBalanceError,
      path: ["sellAmount"],
    },
  )
}

export type XcSwapFormValues = z.infer<ReturnType<typeof useSchema>>

type Args = {
  readonly maxSwapSellBalance: string
  readonly maxTwapSellBalance: string
}

export const useXcSwapForm = ({
  maxSwapSellBalance,
  maxTwapSellBalance,
}: Args) => {
  const { account } = useAccount()
  const { isBalanceLoaded, isBalanceLoading } = useAccountBalances()

  const defaultValues: XcSwapFormValues = {
    srcChain: null,
    sellAsset: null,
    sellAmount: getSharedSellAmount(),
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
    resolver: standardSchemaResolver(
      useSchema(maxSwapSellBalance, maxTwapSellBalance),
    ),
  })

  useSharedSellAmountSync(form)

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
