import Big from "big.js"

import { useAssets } from "@/providers/assetsProvider"
import { useAccountBalances } from "@/states/account"
import { useAssetPrice } from "@/states/displayAsset"
import { scaleHuman } from "@/utils/formatting"

// TODO is this correct? - useWalletAssetsTotals
export const useWalletBalancesSectionData = () => {
  const { getAsset } = useAssets()
  const { balances } = useAccountBalances()
  const { price, isValid } = useAssetPrice("10")

  const totalAssets = Object.values(balances).reduce((acc, balance) => {
    const asset = getAsset(balance.assetId)

    if (!asset) {
      return acc
    }

    const assetBalance = scaleHuman(balance.total, asset.decimals)
    const assetPrice = new Big(isValid ? price : 0).times(assetBalance)

    return acc.plus(assetPrice)
  }, new Big(0))

  return {
    assets: totalAssets.toString(),
    // TODO integrate wallet header balances
    liquidity: "10301874",
    farms: "10301874",
    supplyBorrow: "10301874",
  }
}
