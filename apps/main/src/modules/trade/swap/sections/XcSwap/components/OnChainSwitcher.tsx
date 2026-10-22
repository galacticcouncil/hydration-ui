import { RUNTIME_DECIMALS } from "@galacticcouncil/common"
import { SELL_ONLY_ASSETS } from "@galacticcouncil/utils"
import Big from "big.js"
import { FC } from "react"
import { useFormContext } from "react-hook-form"
import { isNumber } from "remeda"

import { Trade } from "@/api/trade"
import { TradeAssetSwitcher } from "@/components/AssetSwitcher/TradeAssetSwitcher"
import { useSwitchXcAssets } from "@/modules/trade/swap/sections/XcSwap/hooks/useSwitchXcAssets"
import { XcSwapFormValues } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapForm"
import { scaleHuman } from "@/utils/formatting"

type Props = {
  readonly swap: Trade | undefined
}

export const OnChainSwitcher: FC<Props> = ({ swap }) => {
  const { watch } = useFormContext<XcSwapFormValues>()
  const [sellAsset, buyAsset] = watch(["sellAsset", "buyAsset"])

  const switchAssets = useSwitchXcAssets()

  const price = (() => {
    if (!swap?.spotPrice) {
      return null
    }

    return Big(scaleHuman(swap.spotPrice, RUNTIME_DECIMALS)).toString()
  })()

  const sellAssetId = sellAsset?.id ?? ""

  return (
    <TradeAssetSwitcher
      assetInId={sellAssetId}
      assetOutId={isNumber(buyAsset?.id) ? String(buyAsset.id) : ""}
      price={price}
      disabled={!!sellAssetId && SELL_ONLY_ASSETS.includes(sellAssetId)}
      onSwitch={switchAssets}
    />
  )
}
