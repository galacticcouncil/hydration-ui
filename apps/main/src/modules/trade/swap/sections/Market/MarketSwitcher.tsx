import { useQuery } from "@tanstack/react-query"
import { FC } from "react"
import { useFormContext } from "react-hook-form"

import { spotPrice } from "@/api/spotPrice"
import { AssetSwitcher } from "@/components/AssetSwitcher/AssetSwitcher"
import { MarketFormValues } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { useSwitchAssets } from "@/modules/trade/swap/sections/Market/lib/useSwitchAssets"
import { useRpcProvider } from "@/providers/rpcProvider"
import { SELL_ONLY_ASSETS } from "@/utils/consts"

export const MarketSwitcher: FC = () => {
  const rpc = useRpcProvider()
  const { watch } = useFormContext<MarketFormValues>()

  const [sellAsset, buyAsset] = watch(["sellAsset", "buyAsset"])

  const { data: spotPriceData, isPending: isSpotPricePending } = useQuery(
    spotPrice(rpc, buyAsset?.id ?? "", sellAsset?.id ?? ""),
  )

  const switchAssets = useSwitchAssets()

  return (
    <AssetSwitcher
      assetInId={sellAsset?.id ?? ""}
      assetOutId={buyAsset?.id ?? ""}
      fallbackPrice={spotPriceData?.spotPrice ?? undefined}
      disabled={
        switchAssets.isPending ||
        (!!sellAsset && SELL_ONLY_ASSETS.includes(sellAsset.id))
      }
      isFallbackPriceLoading={isSpotPricePending}
      onSwitchAssets={() => switchAssets.mutate()}
    />
  )
}
