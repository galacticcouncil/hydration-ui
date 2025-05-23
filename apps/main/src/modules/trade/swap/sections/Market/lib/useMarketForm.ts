import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { TAssetData } from "@/api/assets"
import { useAssets } from "@/providers/assetsProvider"
import { NATIVE_ASSET_ID, USDT_ASSET_ID } from "@/utils/consts"
import {
  positive,
  required,
  requiredObject,
  useValidateFormMaxBalance,
  validateAssetSellOnly,
} from "@/utils/validators"

export type SwapType = "swap" | "twap"

const useSchema = () => {
  const refineMaxBalance = useValidateFormMaxBalance()

  return z
    .object({
      sellAsset: requiredObject<TAssetData>(),
      sellAmount: required.pipe(positive),
      buyAsset: requiredObject<TAssetData>().check(validateAssetSellOnly),
      buyAmount: required.pipe(positive),
      type: z.custom<SwapType>(),
    })
    .check(
      refineMaxBalance("sellAmount", (form) => [
        form.sellAsset,
        form.sellAmount,
      ]),
    )
}

export type MarketFormValues = z.infer<ReturnType<typeof useSchema>>

type Args = {
  readonly assetIn: string | undefined
  readonly assetOut: string | undefined
}

export const useMarketForm = ({
  assetIn = USDT_ASSET_ID,
  assetOut = NATIVE_ASSET_ID,
}: Args) => {
  const { getAsset } = useAssets()

  const defaultValues: MarketFormValues = {
    sellAmount: "",
    buyAmount: "",
    type: "swap",
    buyAsset: assetOut ? (getAsset(assetOut) ?? null) : null,
    sellAsset: assetIn ? (getAsset(assetIn) ?? null) : null,
  }

  return useForm<MarketFormValues>({
    defaultValues,
    mode: "onChange",
    resolver: standardSchemaResolver(useSchema()),
  })
}
