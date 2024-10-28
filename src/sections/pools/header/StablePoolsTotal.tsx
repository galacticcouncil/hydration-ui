import { useAccountsBalances } from "api/accountBalances"
import BigNumber from "bignumber.js"
import { derivePoolAccount } from "sections/pools/PoolsPage.utils"
import { BN_0, BN_1 } from "utils/constants"
import { useDisplayPrices } from "utils/displayAsset"
import { HeaderTotalData } from "./PoolsHeaderTotal"
import { useAssets } from "providers/assets"

export const StablePoolsTotal = () => {
  const { getAssetWithFallback, stableswap } = useAssets()

  const stablepoolIds =
    stableswap.map((stablepool) => derivePoolAccount(stablepool.id)) ?? []

  const stablePoolBalances = useAccountsBalances(stablepoolIds)

  const totalBalances =
    stablePoolBalances.data?.reduce<Record<string, BigNumber>>(
      (memo, stablePoolBalance) => {
        stablePoolBalance.balances.forEach((balance) => {
          const id = balance.assetId.toString()
          const free = balance.freeBalance

          if (memo[id]) {
            memo[id] = memo[id].plus(free)
          } else {
            memo[id] = free
          }
        })

        return memo
      },
      {},
    ) ?? {}

  const spotPrices = useDisplayPrices(Object.keys(totalBalances))
  const isLoading =
    stablePoolBalances.isInitialLoading || spotPrices.isInitialLoading
  const total = !spotPrices.isInitialLoading
    ? Object.entries(totalBalances).reduce((memo, totalBalance) => {
        const [assetId, balance] = totalBalance

        const spotPrice =
          spotPrices.data?.find((spotPrices) => spotPrices?.tokenIn === assetId)
            ?.spotPrice ?? BN_1

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
