import { useAccount } from "@galacticcouncil/web3-connect"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod/v4"

import { TAssetData } from "@/api/assets"
import { TradeType } from "@/api/trade"
import { useAssets } from "@/providers/assetsProvider"
import { useAccountBalances } from "@/states/account"
import {
  positiveOptional,
  requiredObject,
  useValidateFormMaxBalance,
  validateAssetSellOnly,
} from "@/utils/validators"

const schema = z.object({
  sellAsset: requiredObject<TAssetData>(),
  sellAmount: positiveOptional,
  buyAsset: requiredObject<TAssetData>().check(validateAssetSellOnly),
  buyAmount: positiveOptional,
  type: z.custom<TradeType>(),
  isSingleTrade: z.boolean(),
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

export type MarketFormValues = z.infer<ReturnType<typeof useSchema>>

type Args = {
  readonly assetIn: string
  readonly assetOut: string
}

export const useMarketForm = ({ assetIn, assetOut }: Args) => {
  const { account } = useAccount()
  const { getAsset } = useAssets()
  const { isBalanceLoading } = useAccountBalances()

  const defaultValues: MarketFormValues = {
    sellAsset: getAsset(assetIn) ?? null,
    sellAmount: "",
    buyAsset: getAsset(assetOut) ?? null,
    buyAmount: "",
    type: TradeType.Sell,
    isSingleTrade: true,
  }

  const form = useForm<MarketFormValues>({
    defaultValues,
    mode: "onChange",
    resolver: standardSchemaResolver(useSchema()),
  })

  const { trigger } = form
  useEffect(() => {
    if (account && !isBalanceLoading) {
      trigger()
    }
  }, [account, isBalanceLoading, trigger])

  return form
}
