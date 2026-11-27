import { SELL_ONLY_ASSETS } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import { FC } from "react"
import { useFormContext } from "react-hook-form"

import { spotPriceQuery } from "@/api/spotPrice"
import { AssetSwitcher } from "@/components/AssetSwitcher/AssetSwitcher"
import { DcaFormValues } from "@/modules/trade/swap/sections/DCA/useDcaForm"
import { useSwitchAssets } from "@/modules/trade/swap/sections/DCA/useSwitchAssets"
import { useRpcProvider } from "@/providers/rpcProvider"

export const DcaAssetSwitcher: FC = () => {
  const rpc = useRpcProvider()
  const { watch } = useFormContext<DcaFormValues>()

  const [sellAsset, buyAsset] = watch(["sellAsset", "buyAsset"])

  const { data: spotPriceData, isPending: isSpotPricePending } = useQuery(
    spotPriceQuery(rpc, sellAsset?.id ?? "", buyAsset?.id ?? ""),
  )

  const switchAssets = useSwitchAssets()

  return (
    <AssetSwitcher
      defaultView="reversed"
      assetInId={sellAsset?.id ?? ""}
      assetOutId={buyAsset?.id ?? ""}
      onSwitchAssets={() => switchAssets.mutate()}
      disabled={
        switchAssets.isPending ||
        (!!sellAsset && SELL_ONLY_ASSETS.includes(sellAsset.id))
      }
      fallbackPrice={spotPriceData?.spotPrice ?? undefined}
      isFallbackPriceLoading={isSpotPricePending}
    />
  )
}
