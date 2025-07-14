import { useAccount } from "@galacticcouncil/web3-connect"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useForm } from "react-hook-form"
import * as z from "zod/v4"

import { TAssetData } from "@/api/assets"
import { useAssets } from "@/providers/assetsProvider"
import {
  positive,
  required,
  requiredObject,
  useValidateFormMaxBalance,
  validateAssetSellOnly,
} from "@/utils/validators"

// TODO broken export from sdk-next
export enum TradeType {
  Sell = "Sell",
  Buy = "Buy",
}

export enum TradeOrderType {
  Dca = "Dca",
  TwapSell = "TwapSell",
  TwapBuy = "TwapBuy",
}

const schema = z.object({
  sellAsset: requiredObject<TAssetData>(),
  sellAmount: required.pipe(positive),
  buyAsset: requiredObject<TAssetData>().check(validateAssetSellOnly),
  buyAmount: required.pipe(positive),
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
  const { getAsset } = useAssets()

  const defaultValues: MarketFormValues = {
    sellAsset: getAsset(assetIn) ?? null,
    sellAmount: "",
    buyAsset: getAsset(assetOut) ?? null,
    buyAmount: "",
    type: TradeType.Sell,
    isSingleTrade: true,
  }

  return useForm<MarketFormValues>({
    defaultValues,
    mode: "onChange",
    resolver: standardSchemaResolver(useSchema()),
  })
}
