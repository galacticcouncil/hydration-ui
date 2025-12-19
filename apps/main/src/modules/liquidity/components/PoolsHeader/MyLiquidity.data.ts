import Big from "big.js"
import { useMemo } from "react"

import { AssetType } from "@/api/assets"
import { useMyIsolatedPoolsLiquidity } from "@/modules/wallet/assets/MyLiquidity/MyIsolatedPoolsLiquidity.data"
import {
  isOmnipoolDepositPosition,
  useAccountBalancesWithPriceByAssetType,
  useAccountOmnipoolPositionsData,
} from "@/states/account"
import { toBig } from "@/utils/formatting"

export const useMyLiquidityTotals = () => {
  const { data: positions, isLoading: isLoadingPositions } =
    useAccountOmnipoolPositionsData()

  const {
    data: isolatedPoolsLiquidity,
    isLoading: isLoadingIsolatedPoolsLiquidity,
  } = useMyIsolatedPoolsLiquidity()
  const { data: balancesWithPrice, isLoading: isBalanceLoading } =
    useAccountBalancesWithPriceByAssetType([AssetType.STABLESWAP])

  const stableSwapBalances = balancesWithPrice?.stableSwapBalances

  const {
    liquidityTotal,
    farmingTotal,
    stableSwapTotal,
    omnipoolLiquidity,
    isolatedPoolsLiquidityTotals,
  } = useMemo(() => {
    const omnipoolLiquidity = (positions?.all ?? []).reduce(
      (acc, position) => {
        acc.liquidity = acc.liquidity.plus(
          position.data?.currentTotalDisplay ?? 0,
        )

        if (isOmnipoolDepositPosition(position)) {
          acc.farming = acc.farming.plus(
            position.data?.currentTotalDisplay ?? 0,
          )
        }

        return acc
      },
      {
        liquidity: Big(0),
        farming: Big(0),
      },
    )

    const isolatedPoolsLiquidityTotals = isolatedPoolsLiquidity.reduce(
      (acc, asset) => {
        acc.liquidity = acc.liquidity.plus(asset.currentTotalDisplay ?? 0)
        acc.farming = acc.farming.plus(
          asset.positions.reduce((acc, position) => {
            const displayValue = toBig(
              position.shares,
              position.meta.decimals,
            ).times(position.price)

            return acc.plus(displayValue)
          }, Big(0)),
        )
        return acc
      },
      { liquidity: Big(0), farming: Big(0) },
    )

    const stableSwapTotal = (stableSwapBalances ?? []).reduce(
      (acc, { balance, meta, price }) => {
        const balanceShifted = toBig(balance.transferable, meta.decimals)

        const displayValue = price ? balanceShifted.times(price) : "0"

        return acc.plus(displayValue)
      },
      Big(0),
    )

    const liquidityTotal = omnipoolLiquidity.liquidity
      .plus(stableSwapTotal)
      .plus(isolatedPoolsLiquidityTotals.liquidity)

    const farmingTotal = omnipoolLiquidity.farming.plus(
      isolatedPoolsLiquidityTotals.farming,
    )

    return {
      omnipoolLiquidity,
      stableSwapTotal,
      liquidityTotal,
      farmingTotal,
      isolatedPoolsLiquidityTotals,
    }
  }, [isolatedPoolsLiquidity, positions?.all, stableSwapBalances])

  return {
    liquidityTotal: liquidityTotal.toString(),
    farmingTotal: farmingTotal.toString(),
    omnipoolLiquidityTotal: omnipoolLiquidity.liquidity.toString(),
    stablepoolTotal: stableSwapTotal.toString(),
    isolatedPoolsTotal: isolatedPoolsLiquidityTotals.liquidity.toString(),
    isBalanceLoading: isBalanceLoading,
    isLiquidityLoading: isLoadingIsolatedPoolsLiquidity || isLoadingPositions,
  }
}
