import { FC } from "react"
import { useFormContext } from "react-hook-form"

import { AssetSwitcher } from "@/components/AssetSwitcher/AssetSwitcher"
import { MarketFormValues } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { useSwitchAssets } from "@/modules/trade/swap/sections/Market/lib/useSwitchAssets"
import { SELL_ONLY_ASSETS } from "@/utils/consts"

export const MarketSwitcher: FC = () => {
  const { watch } = useFormContext<MarketFormValues>()

  const [sellAsset, sellAmount, buyAsset, buyAmount] = watch([
    "sellAsset",
    "sellAmount",
    "buyAsset",
    "buyAmount",
  ])

  const switchAssets = useSwitchAssets()

  return (
    <AssetSwitcher
      assetInId={sellAsset?.id ?? ""}
      assetOutId={buyAsset?.id ?? ""}
      priceIn={sellAmount}
      priceOut={buyAmount}
      disabled={
        switchAssets.isPending ||
        (!!sellAsset && SELL_ONLY_ASSETS.includes(sellAsset.id))
      }
      onSwitchAssets={() => switchAssets.mutate()}
    />
  )
}
