import Big from "big.js"

import { useAssets } from "@/providers/assetsProvider"
import { useAccountBalances } from "@/states/account"
import { useAssetsPrice } from "@/states/displayAsset"
import { scaleHuman } from "@/utils/formatting"

// TODO is this correct? - useWalletAssetsTotals
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

  return {
    assets: totalAssets.toString(),
    // TODO integrate wallet header balances
    liquidity: "10301874",
    farms: "10301874",
    supplyBorrow: "10301874",
  }
}
