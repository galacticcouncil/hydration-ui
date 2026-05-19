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
  maxBalanceError,
  positiveOptional,
  requiredObject,
  validateAssetSellOnly,
  validateMaxBalance,
} from "@/utils/validators"

const schema = z.object({
  sellAsset: requiredObject<TAssetData>(),
  sellAmount: positiveOptional,
  buyAsset: requiredObject<TAssetData>().check(validateAssetSellOnly),
  buyAmount: positiveOptional,
  type: z.custom<TradeType>(),
  isSingleTrade: z.boolean(),
})

const useSchema = (maxSwapSellBalance: string, maxTwapSellBalance: string) => {
  const { account } = useAccount()

  if (!account) {
    return schema
  }

  return schema.refine(
    (form) => {
      return validateMaxBalance(
        form.isSingleTrade ? maxSwapSellBalance : maxTwapSellBalance,
        form.sellAmount,
      )
    },
    {
      error: maxBalanceError,
      path: ["sellAmount"],
    },
  )
}

export type MarketFormValues = z.infer<ReturnType<typeof useSchema>>

type Args = {
  readonly assetIn: string
  readonly assetOut: string
  readonly maxSwapSellBalance: string
  readonly maxTwapSellBalance: string
}

export const useMarketForm = ({
  assetIn,
  assetOut,
  maxSwapSellBalance,
  maxTwapSellBalance,
}: Args) => {
  const { account } = useAccount()
  const { getAsset } = useAssets()

  const { isBalanceLoaded, isBalanceLoading } = useAccountBalances()

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
    resolver: standardSchemaResolver(
      useSchema(maxSwapSellBalance, maxTwapSellBalance),
    ),
  })

  const { trigger, getValues } = form
  useEffect(() => {
    const { sellAsset, buyAsset, type } = getValues()

    if (!account || !sellAsset || !buyAsset) {
      return
    }

    if (
      type === TradeType.Buy &&
      (isBalanceLoaded(buyAsset.id) || !isBalanceLoading)
    ) {
      trigger("buyAmount")
    } else if (
      (type === TradeType.Sell && isBalanceLoaded(sellAsset.id)) ||
      !isBalanceLoading
    ) {
      trigger("sellAmount")
    }
  }, [account, isBalanceLoading, trigger, getValues, isBalanceLoaded])

  return form
}
