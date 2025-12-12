import Big from "big.js"

import { useUserBorrowSummary } from "@/api/borrow"
import { useMyLiquidityAmount } from "@/modules/liquidity/components/PoolsHeader/MyLiquidity.data"
import { useAssets } from "@/providers/assetsProvider"
import {
  isOmnipoolDepositPosition,
  useAccountBalances,
  useAccountOmnipoolPositionsData,
} from "@/states/account"
import { useAssetsPrice } from "@/states/displayAsset"
import { scaleHuman } from "@/utils/formatting"

export const useWalletBalancesSectionData = () => {
  const { totalAmount, isLoading } = useMyLiquidityAmount()

  const { data: positions, isLoading: isLoadingPositions } =
    useAccountOmnipoolPositionsData()

  const { data: userBorrowSummary, isLoading: isLoadingBorrowSummary } =
    useUserBorrowSummary()

  const { getAsset } = useAssets()
  const { balances, isBalanceLoading } = useAccountBalances()
  const { getAssetPrice, isLoading: isAssetPriceLoading } = useAssetsPrice(
    Array.from(new Set(Object.keys(balances))),
  )

  const totalAssets = Object.values(balances).reduce((acc, balance) => {
    const asset = getAsset(balance.assetId)

    if (!asset) {
      return acc
    }

    const assetBalance = scaleHuman(balance.total, asset.decimals)
    const assetPrice = getAssetPrice(balance.assetId)
    const balancePrice = new Big(
      assetPrice.isValid ? assetPrice.price : 0,
    ).times(assetBalance)

    return acc.plus(balancePrice)
  }, new Big(0))

  const omnipoolLiquidity = positions?.all.reduce(
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
    assets: totalAssets.toString(),
    isAssetsLoading: isBalanceLoading || isAssetPriceLoading,
    liquidity: totalAmount,
    farms: omnipoolLiquidity?.farming.toString() ?? "",
    isLiquidityLoading: isLoading || isLoadingPositions,
    supply: userBorrowSummary?.totalLiquidityUSD ?? "",
    borrow: userBorrowSummary?.totalBorrowsUSD ?? "",
    isBorrowLoading: isLoadingBorrowSummary,
  }
}
