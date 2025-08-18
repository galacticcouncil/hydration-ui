import { useUserData } from "@galacticcouncil/money-market/hooks"
import Big from "big.js"

import { useMyLiquidityAmount } from "@/modules/liquidity/components/PoolsHeader/MyLiquidity.data"
import { useAssets } from "@/providers/assetsProvider"
import { useAccountBalances } from "@/states/account"
import { useAssetsPrice } from "@/states/displayAsset"
import { scaleHuman } from "@/utils/formatting"

export const useWalletBalancesSectionData = () => {
  const { getAsset } = useAssets()
  const { balances } = useAccountBalances()
  const { getAssetPrice } = useAssetsPrice(
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

  const { totalAmount, omnipool } = useMyLiquidityAmount()
  const { totalBorrowsUSD, totalLiquidityUSD } = useUserData()

  return {
    assets: totalAssets.toString(),
    liquidity: totalAmount,
    farms: omnipool?.farming.toString() ?? "0",
    supply: totalLiquidityUSD,
    borrow: totalBorrowsUSD,
  }
}
