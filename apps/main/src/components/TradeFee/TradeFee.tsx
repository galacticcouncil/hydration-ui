import { Skeleton } from "@galacticcouncil/ui/components"
import Big from "big.js"

import { TAssetData } from "@/api/assets"
import { Trade } from "@/api/trade"
import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { TSelectedAsset } from "@/components/AssetSelect/AssetSelect"
import { DynamicFee } from "@/components/DynamicFee"
import { scaleHuman } from "@/utils/formatting"
import { getTradeFeeIntervals } from "@/utils/trade"

export const TradeFee = ({
  swap,
  receiveAsset,
  isLoading,
}: {
  swap?: Trade
  receiveAsset: TSelectedAsset | TAssetData
  isLoading: boolean
}) => {
  const tradeFee = swap
    ? scaleHuman(swap.tradeFee, receiveAsset.decimals)
    : undefined
  const tradeFeePct = swap?.tradeFeePct ?? 0
  const tradeFeeRange = swap?.tradeFeeRange ?? [0, 0]

  const [tradeFeeDisplay] = useDisplayAssetPrice(
    receiveAsset.id,
    tradeFee ?? "0",
    { maximumFractionDigits: null },
  )

  const [min, max] = tradeFeeRange
  const [
    ,
    mediumLow = Number.MAX_SAFE_INTEGER,
    mediumHigh = Number.MAX_SAFE_INTEGER,
  ] = getTradeFeeIntervals(min, max)

  if (!isLoading && (!tradeFee || Big(tradeFee).eq(0))) {
    return "-"
  }

  if (isLoading) return <Skeleton width={100} sx={{ height: 18 }} />

  return (
    <DynamicFee
      amount={tradeFeeDisplay}
      value={tradeFeePct}
      rangeLow={mediumLow}
      rangeHigh={mediumHigh}
    />
  )
}
