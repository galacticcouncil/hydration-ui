import { useAccount } from "@galacticcouncil/web3-connect"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod/v4"

import { TAsset, useAssets } from "@/providers/assetsProvider"
import { useAccountBalances } from "@/states/account"
import {
  positiveOptional,
  requiredObject,
  useValidateFormMaxBalance,
  validateAssetSellOnly,
} from "@/utils/validators"

export const EXPIRY_OPTIONS = ["open", "1h", "24h", "48h"] as const
export type ExpiryOption = (typeof EXPIRY_OPTIONS)[number]

const schemaBase = z.object({
  sellAsset: requiredObject<TAsset>(),
  sellAmount: positiveOptional,
  buyAsset: requiredObject<TAsset>().check(validateAssetSellOnly),
  buyAmount: positiveOptional,
  limitPrice: positiveOptional,
  expiry: z.enum(EXPIRY_OPTIONS),
})

export type LimitFormValues = z.infer<typeof schemaBase>

const useSchema = () => {
  const { account } = useAccount()
  const refineMaxBalance = useValidateFormMaxBalance()

  if (!account) {
    return schemaBase
  }

  return schemaBase.check(
    refineMaxBalance("sellAmount", (form) => [form.sellAsset, form.sellAmount]),
  )
}

type Args = {
  readonly assetIn: string
  readonly assetOut: string
}

export const useLimitForm = ({ assetIn, assetOut }: Args) => {
  const { account } = useAccount()
  const { getAsset } = useAssets()
  const { isBalanceLoaded, isBalanceLoading } = useAccountBalances()

  const defaultValues: LimitFormValues = {
    sellAsset: getAsset(assetIn) ?? null,
    sellAmount: "",
    buyAsset: getAsset(assetOut) ?? null,
    buyAmount: "",
    limitPrice: "",
    expiry: "open",
  }

  const form = useForm<LimitFormValues>({
    defaultValues,
    mode: "onChange",
    resolver: standardSchemaResolver(useSchema()),
  })

  const { trigger, getValues } = form

  useEffect(() => {
    const { sellAsset } = getValues()

    if (!account || !sellAsset) {
      return
    }

    if (isBalanceLoaded(sellAsset.id) || !isBalanceLoading) {
      trigger("sellAmount")
    }
  }, [account, isBalanceLoading, trigger, getValues, isBalanceLoaded])

  return form
}
