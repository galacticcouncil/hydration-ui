import Big from "big.js"

import {
  isOmnipoolDepositPosition,
  useAccountOmnipoolPositionsData,
} from "@/states/account"
import { useOmnipoolStablepoolAssets } from "@/states/liquidity"

export const useMyLiquidityAmount = () => {
  const { data = [], isLoading } = useOmnipoolStablepoolAssets()
  const { data: positions, isLoading: isLoadingPositions } =
    useAccountOmnipoolPositionsData()

  const stablepoolTotal = data
    .reduce(
      (acc, asset) =>
        asset.isStablePool ? acc.plus(asset.balanceDisplay ?? 0) : acc,
      Big(0),
    )
    .toString()

  const omnipool = positions?.all.reduce(
    (acc, position) => {
      acc.liquidity = acc.liquidity.plus(
        position.data?.currentTotalDisplay ?? 0,
      )

      if (isOmnipoolDepositPosition(position)) {
        acc.farming = acc.farming.plus(position.data?.currentTotalDisplay ?? 0)
      }

      return acc
    },
    {
      liquidity: Big(0),
      farming: Big(0),
    },
  )

  return {
    totalAmount: Big(stablepoolTotal)
      .plus(omnipool?.liquidity ?? 0)
      .toString(),
    omnipool,
    stablepoolTotal,
    isLoading,
    isLoadingPositions,
  }
}
