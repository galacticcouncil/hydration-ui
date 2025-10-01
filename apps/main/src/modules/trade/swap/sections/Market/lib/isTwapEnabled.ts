import { Trade } from "@galacticcouncil/sdk-next/build/types/sor"

import { PoolType } from "@/api/pools"

export const isTwapEnabled = (swapData: Trade | undefined): boolean =>
  swapData?.swaps.every(
    (swap) => ![PoolType.LBP, PoolType.XYK].includes(swap.pool),
  ) ?? true
