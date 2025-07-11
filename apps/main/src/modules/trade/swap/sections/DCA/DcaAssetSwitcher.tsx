import { TradeDcaOrder } from "@galacticcouncil/sdk-next/build/types/sor"
import { useQuery } from "@tanstack/react-query"
import { FC } from "react"
import { useFormContext } from "react-hook-form"

import { spotPrice } from "@/api/spotPrice"
import { AssetSwitcher } from "@/components/AssetSwitcher/AssetSwitcher"
import { DcaFormValues } from "@/modules/trade/swap/sections/DCA/useDcaForm"
import { useSwitchAssets } from "@/modules/trade/swap/sections/DCA/useSwitchAssets"
import { useRpcProvider } from "@/providers/rpcProvider"
import { SELL_ONLY_ASSETS } from "@/utils/consts"
import { scaleHuman } from "@/utils/formatting"

type Props = {
  readonly order: TradeDcaOrder | undefined
}

export const DcaAssetSwitcher: FC<Props> = ({ order }) => {
  const rpc = useRpcProvider()
  const { watch } = useFormContext<DcaFormValues>()

  const [sellAsset, buyAsset, sellAmount] = watch([
    "sellAsset",
    "buyAsset",
    "sellAmount",
  ])

  const { data: spotPriceData, isPending: isSpotPricePending } = useQuery(
    spotPrice(rpc, buyAsset?.id ?? "", sellAsset?.id ?? ""),
  )

  const switchAssets = useSwitchAssets()

  return (
    <AssetSwitcher
      assetInId={sellAsset?.id ?? ""}
      assetOutId={buyAsset?.id ?? ""}
      onSwitchAssets={() => switchAssets.mutate()}
      priceIn={sellAmount}
      priceOut={
        buyAsset ? scaleHuman(order?.amountOut || "0", buyAsset.decimals) : "0"
      }
      disabled={
        switchAssets.isPending ||
        (!!sellAsset && SELL_ONLY_ASSETS.includes(sellAsset.id))
      }
      fallbackPrice={spotPriceData?.spotPrice ?? undefined}
      isFallbackPriceLoading={isSpotPricePending}
    />
  )
}
