import Big from "big.js"
import { useMemo } from "react"

import { AssetType } from "@/api/assets"
import { useUserBorrowSummary } from "@/api/borrow"
import { useMyIsolatedPoolsLiquidity } from "@/modules/wallet/assets/MyLiquidity/MyIsolatedPoolsLiquidity.data"
import {
  isOmnipoolDepositPosition,
  useAccountBalancesWithPriceByAssetType,
  useAccountOmnipoolPositionsData,
} from "@/states/account"
import { toBig } from "@/utils/formatting"

const calculateBalancesTotal = (
  balances: Array<{
    balance: { transferable: bigint }
    meta: { decimals: number }
    price?: string
  }>,
) => {
  if (!balances) return Big(0)

  return balances.reduce((acc, { balance, meta, price }) => {
    const balanceShifted = toBig(balance.transferable, meta.decimals)
    const displayValue = price ? balanceShifted.times(price).toString() : "0"
    return acc.plus(displayValue)
  }, Big(0))
}

export const useWalletBalancesSectionData = () => {
  const { data: positions, isLoading: isLoadingPositions } =
    useAccountOmnipoolPositionsData()

  const {
    data: isolatedPoolsLiquidity,
    isLoading: isLoadingIsolatedPoolsLiquidity,
  } = useMyIsolatedPoolsLiquidity()

  const { data: userBorrowSummary, isLoading: isLoadingBorrowSummary } =
    useUserBorrowSummary()

  const { data: balancesWithPrice, isLoading: isBalanceLoading } =
    useAccountBalancesWithPriceByAssetType([
      AssetType.STABLESWAP,
      AssetType.TOKEN,
      AssetType.ERC20,
    ])

  const { liquidityTotal, farmingTotal, assetsTotal } = useMemo(() => {
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
            const displaValue = toBig(
              position.shares,
              position.meta.decimals,
            ).times(position.price)

            return acc.plus(displaValue ?? 0)
          }, Big(0)),
        )
        return acc
      },
      { liquidity: Big(0), farming: Big(0) },
    )

    const tokensTotal = calculateBalancesTotal(
      balancesWithPrice?.tokenBalances ?? [],
    )

    const erc20Total = calculateBalancesTotal(
      balancesWithPrice?.erc20Balances ?? [],
    )

    const stableSwapTotal = calculateBalancesTotal(
      balancesWithPrice?.stableSwapBalances ?? [],
    )

    const assetsTotal = tokensTotal.plus(erc20Total)

    const liquidityTotal = omnipoolLiquidity.liquidity
      .plus(stableSwapTotal)
      .plus(isolatedPoolsLiquidityTotals.liquidity)

    const farmingTotal = omnipoolLiquidity.farming.plus(
      isolatedPoolsLiquidityTotals.farming,
    )

    return { omnipoolLiquidity, assetsTotal, liquidityTotal, farmingTotal }
  }, [balancesWithPrice, isolatedPoolsLiquidity, positions?.all])

  return {
    assets: assetsTotal.toString(),
    isAssetsLoading: isBalanceLoading,
    liquidity: liquidityTotal.toString(),
    farms: farmingTotal.toString(),
    isLiquidityLoading: isLoadingIsolatedPoolsLiquidity || isLoadingPositions,
    supply: userBorrowSummary?.totalLiquidityUSD ?? "",
    borrow: userBorrowSummary?.totalBorrowsUSD ?? "",
    isBorrowLoading: isLoadingBorrowSummary,
  }
}
