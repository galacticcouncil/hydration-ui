import { useAccountsBalances } from "api/accountBalances"
import BigNumber from "bignumber.js"
import { derivePoolAccount } from "sections/pools/PoolsPage.utils"
import { BN_0, BN_1 } from "utils/constants"
import { useDisplayPrices } from "utils/displayAsset"
import { HeaderTotalData } from "./PoolsHeaderTotal"
import { useAssets } from "providers/assets"
import { useAccountAssets } from "api/deposits"
import { useMemo } from "react"

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

export const useMyStablePoolaTotal = () => {
  const { data } = useAccountAssets()

  const { stablepoolIds, stablepoolBalances } = useMemo(() => {
    const stablepoolIds = []
    const stablepoolBalances = []
    if (data) {
      for (const [key, value] of data.accountStableswapMap) {
        if (value.balance.freeBalance.gt(0)) {
          stablepoolIds.push(key)
          stablepoolBalances.push(value)
        }
      }
    }
    return { stablepoolIds, stablepoolBalances }
  }, [data])

  const spotPrices = useDisplayPrices(stablepoolIds, true)
  const isLoading = spotPrices.isInitialLoading

  const value = !isLoading
    ? stablepoolBalances.reduce((memo, balance) => {
        const { assetId, freeBalance } = balance.balance

        const spotPrice =
          spotPrices.data?.find(
            (spotPrices) => spotPrices?.tokenIn === assetId.toString(),
          )?.spotPrice ?? BN_1

        const meta = balance.asset

        const balanceDisplay = freeBalance
          .shiftedBy(-meta.decimals)
          .multipliedBy(spotPrice)

        return memo.plus(balanceDisplay)
      }, BN_0)
    : BN_0

  return { value, isLoading }
}

export const MyStablePoolsTotal = () => {
  const { value, isLoading } = useMyStablePoolaTotal()
  return <HeaderTotalData isLoading={isLoading} value={value} fontSize={19} />
}
