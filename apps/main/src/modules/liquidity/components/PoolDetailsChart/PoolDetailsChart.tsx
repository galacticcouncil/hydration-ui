import { Flex } from "@galacticcouncil/ui/components"
import { prop } from "remeda"

import { ChartState } from "@/components/ChartState"
import { PairChart } from "@/modules/trade/swap/components/TradeChart/TradeChart"
import { useDisplayAssetStore } from "@/states/displayAsset"

type PoolChartProps = {
  assetId: string
  height: number
  isEmptyData?: boolean
}

export const PoolChart = ({
  assetId,
  height,
  isEmptyData = false,
}: PoolChartProps) => {
  const stableCoinId = useDisplayAssetStore(prop("stableCoinId"))

  return isEmptyData ? (
    <Flex flex={1} direction="column" justify="flex-end" sx={{ minHeight: 0 }}>
      <ChartState sx={{ height }} isEmpty />
    </Flex>
  ) : (
    <PairChart
      variant="pool"
      height={height}
      assetIn={stableCoinId ?? ""}
      assetOut={assetId}
    />
  )
}
