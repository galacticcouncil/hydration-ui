import { useUserData } from "@galacticcouncil/money-market/hooks"
import Big from "big.js"

import { useMyLiquidityAmount } from "@/modules/liquidity/components/PoolsHeader/MyLiquidity.data"
import { useAssets } from "@/providers/assetsProvider"
import { useAccountBalances } from "@/states/account"
import { useAssetsPrice } from "@/states/displayAsset"
import { scaleHuman } from "@/utils/formatting"

export const useWalletBalancesSectionData = () => {
  const { totalAmount, omnipool, isLoading, isLoadingPositions } =
    useMyLiquidityAmount()
  const { totalBorrowsUSD, totalLiquidityUSD, loading } = useUserData()

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

  return {
    assets: totalAssets.toString(),
    isAssetsLoading: isBalanceLoading || isAssetPriceLoading,
    liquidity: totalAmount,
    farms: omnipool?.farming.toString() ?? "0",
    isLiquidityLoading: isLoading || isLoadingPositions,
    supply: totalLiquidityUSD,
    borrow: totalBorrowsUSD,
    isBorrowLoading: loading,
  }
}
