import { RUNTIME_DECIMALS } from "@galacticcouncil/common"
import { SELL_ONLY_ASSETS } from "@galacticcouncil/utils"
import Big from "big.js"
import { FC } from "react"
import { useFormContext } from "react-hook-form"
import { isNumber } from "remeda"

import { Trade } from "@/api/trade"
import { AssetSwitcher } from "@/components/AssetSwitcher/AssetSwitcher"
import { useSwitchXcAssets } from "@/modules/trade/swap/sections/XcSwap/hooks/useSwitchXcAssets"
import { XcSwapFormValues } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapForm"
import { useXcSwap } from "@/modules/trade/swap/sections/XcSwap/XcSwapProvider"
import { scaleHuman } from "@/utils/formatting"

type Props = {
  readonly swap: Trade | undefined
}

export const OnChainSwitcher: FC<Props> = ({ swap }) => {
  const { watch } = useFormContext<XcSwapFormValues>()
  const { isQuoteLoading } = useXcSwap()
  const [srcAsset, destAsset] = watch(["srcAsset", "destAsset"])

  const switchAssets = useSwitchXcAssets()

  const price = (() => {
    if (!swap?.spotPrice) {
      return null
    }

    return Big(scaleHuman(swap.spotPrice, RUNTIME_DECIMALS)).toString()
  })()

  const srcAssetId = isNumber(srcAsset?.id) ? String(srcAsset.id) : ""

  return (
    <AssetSwitcher
      defaultView="reversed"
      assetInId={srcAssetId}
      assetOutId={isNumber(destAsset?.id) ? String(destAsset.id) : ""}
      fallbackPrice={price ?? undefined}
      isFallbackPriceLoading={isQuoteLoading}
      disabled={!!srcAssetId && SELL_ONLY_ASSETS.includes(srcAssetId)}
      onSwitchAssets={switchAssets}
    />
  )
}
