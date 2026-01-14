import { RUNTIME_DECIMALS } from "@galacticcouncil/common"
import { SELL_ONLY_ASSETS } from "@galacticcouncil/utils"
import Big from "big.js"
import { FC } from "react"
import { useFormContext } from "react-hook-form"

import { Trade, TradeType } from "@/api/trade"
import { TradeAssetSwitcher } from "@/components/AssetSwitcher/TradeAssetSwitcher"
import { MarketFormValues } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { useSwitchAssets } from "@/modules/trade/swap/sections/Market/lib/useSwitchAssets"
import { scaleHuman } from "@/utils/formatting"

type Props = {
  readonly swap: Trade | undefined
}

export const MarketSwitcher: FC<Props> = ({ swap }) => {
  const { watch } = useFormContext<MarketFormValues>()
  const [sellAsset, buyAsset, type] = watch(["sellAsset", "buyAsset", "type"])

  const switchAssets = useSwitchAssets()

  const price = (() => {
    if (!swap?.spotPrice) {
      return null
    }

    const spotPrice = Big(scaleHuman(swap.spotPrice, RUNTIME_DECIMALS))

    if (type === TradeType.Sell) {
      return spotPrice.toString()
    }

    if (spotPrice.lte(0)) {
      return "0"
    }

    return Big(1).div(spotPrice).toString()
  })()

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
