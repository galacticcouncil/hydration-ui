import BN from "bignumber.js"
import { BN_0 } from "utils/constants"
import { HeaderTotalData } from "./PoolsHeaderTotal"
import { useAssets } from "providers/assets"
import { useStableSDKPools } from "api/stableswap"
import { useAssetsPrice } from "state/displayPrice"

export const StablePoolsTotal = () => {
  const { getAssetWithFallback } = useAssets()

  const { data: stablePools, isLoading: isPoolLoading } = useStableSDKPools()

  const totalBalances =
    stablePools?.reduce<Record<string, BN>>((memo, stablePool) => {
      stablePool.tokens.forEach((token) => {
        const id = token.id
        const free = token.balance

        if (token.type === "Token") {
          if (memo[id]) {
            memo[id] = BN(memo[id]).plus(free)
          } else {
            memo[id] = BN(free)
          }
        }
      })

      return memo
    }, {}) ?? {}

  const { getAssetPrice, isLoading: isLoadingPrices } = useAssetsPrice(
    Object.keys(totalBalances),
  )

  const isLoading = isPoolLoading || isLoadingPrices
  const total = !isLoadingPrices
    ? Object.entries(totalBalances).reduce((memo, totalBalance) => {
        const [assetId, balance] = totalBalance

        const spotPrice = getAssetPrice(assetId).price

        const meta = getAssetWithFallback(assetId)

        const balanceDisplay = balance
          .shiftedBy(-meta.decimals)
          .multipliedBy(spotPrice)

        return memo.plus(balanceDisplay)
      }, BN_0)
    : BN_0

  return (
    <HeaderTotalData isLoading={isLoading} value={total} fontSize={[19, 24]} />
  )
}
