import { SELL_ONLY_ASSETS } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import { FC } from "react"
import { useFormContext } from "react-hook-form"

import { spotPriceQuery } from "@/api/spotPrice"
import { AssetSwitcher } from "@/components/AssetSwitcher/AssetSwitcher"
import { MarketFormValues } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { useSwitchAssets } from "@/modules/trade/swap/sections/Market/lib/useSwitchAssets"
import { useRpcProvider } from "@/providers/rpcProvider"

type Props = {
  readonly price: string | null
}

export const MarketSwitcher: FC<Props> = ({ price }) => {
  const rpc = useRpcProvider()
  const { watch } = useFormContext<MarketFormValues>()

  const [sellAsset, buyAsset] = watch(["sellAsset", "buyAsset"])

  const { data: spotPriceData, isPending: isSpotPricePending } = useQuery(
    spotPriceQuery(rpc, buyAsset?.id ?? "", sellAsset?.id ?? ""),
  )

  const switchAssets = useSwitchAssets()

  const spotPrice = price ?? spotPriceData?.spotPrice ?? undefined

  return (
    <AssetSwitcher
      assetInId={sellAsset?.id ?? ""}
      assetOutId={buyAsset?.id ?? ""}
      fallbackPrice={spotPrice}
      disabled={
        switchAssets.isPending ||
        (!!sellAsset && SELL_ONLY_ASSETS.includes(sellAsset.id))
      }
      isFallbackPriceLoading={isSpotPricePending}
      onSwitchAssets={() => switchAssets.mutate()}
    />
  )
}
