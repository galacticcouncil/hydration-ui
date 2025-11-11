import { SELL_ONLY_ASSETS } from "@galacticcouncil/utils"
import { FC } from "react"
import { useFormContext } from "react-hook-form"

import { TradeAssetSwitcher } from "@/components/AssetSwitcher/TradeAssetSwitcher"
import { MarketFormValues } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { useSwitchAssets } from "@/modules/trade/swap/sections/Market/lib/useSwitchAssets"

type Props = {
  readonly price: string | null
}

export const MarketSwitcher: FC<Props> = ({ price }) => {
  const { watch } = useFormContext<MarketFormValues>()
  const [sellAsset, buyAsset] = watch(["sellAsset", "buyAsset"])

  const switchAssets = useSwitchAssets()

  return (
    <TradeAssetSwitcher
      assetInId={sellAsset?.id ?? ""}
      assetOutId={buyAsset?.id ?? ""}
      price={price}
      disabled={
        switchAssets.isPending ||
        (!!sellAsset && SELL_ONLY_ASSETS.includes(sellAsset.id))
      }
      onSwitch={() => switchAssets.mutate()}
    />
  )
}
