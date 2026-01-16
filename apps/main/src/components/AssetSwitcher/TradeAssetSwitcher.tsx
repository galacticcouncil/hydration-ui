import { useQuery } from "@tanstack/react-query"
import { FC } from "react"

import { spotPriceQuery } from "@/api/spotPrice"
import { AssetSwitcher } from "@/components/AssetSwitcher/AssetSwitcher"
import { useRpcProvider } from "@/providers/rpcProvider"

type Props = {
  readonly assetInId: string
  readonly assetOutId: string
  readonly price: string | null
  readonly disabled?: boolean
  readonly switcherDisabled?: boolean
  readonly onSwitch?: () => void
}

export const TradeAssetSwitcher: FC<Props> = ({
  assetInId,
  assetOutId,
  price,
  disabled,
  switcherDisabled,
  onSwitch,
}) => {
  const rpc = useRpcProvider()
  const { data: spotPriceData, isPending: isSpotPricePending } = useQuery(
    spotPriceQuery(rpc, assetInId, assetOutId),
  )
  const spotPrice = price ?? spotPriceData?.spotPrice ?? undefined

  return (
    <AssetSwitcher
      defaultView="reversed"
      assetInId={assetInId}
      assetOutId={assetOutId}
      fallbackPrice={spotPrice}
      disabled={disabled}
      switcherDisabled={switcherDisabled}
      isFallbackPriceLoading={isSpotPricePending}
      onSwitchAssets={onSwitch}
    />
  )
}
