import { SELL_ONLY_ASSETS } from "@galacticcouncil/utils"
import { FC } from "react"
import { useFormContext } from "react-hook-form"

import { AssetSwitcher } from "@/components/AssetSwitcher/AssetSwitcher"
import { LimitFormValues } from "@/modules/trade/swap/sections/Limit/useLimitForm"
import { useSwitchAssets } from "@/modules/trade/swap/sections/Limit/useSwitchAssets"

export const LimitAssetSwitcher: FC = () => {
  const { watch } = useFormContext<LimitFormValues>()

  const [sellAsset, buyAsset] = watch(["sellAsset", "buyAsset"])

  const switchAssets = useSwitchAssets()

  return (
    <AssetSwitcher
      assetInId={sellAsset?.id ?? ""}
      assetOutId={buyAsset?.id ?? ""}
      onSwitchAssets={() => switchAssets.mutate()}
      disabled={
        switchAssets.isPending ||
        (!!sellAsset && SELL_ONLY_ASSETS.includes(sellAsset.id))
      }
      hidePrice
    />
  )
}
