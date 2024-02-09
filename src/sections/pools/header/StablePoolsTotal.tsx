import { useAccountsBalances } from "api/accountBalances"
import { useStableswapPools } from "api/stableswap"
import BigNumber from "bignumber.js"
import { useRpcProvider } from "providers/rpcProvider"
import { derivePoolAccount } from "sections/pools/PoolsPage.utils"
import { BN_0, BN_1 } from "utils/constants"
import { useDisplayPrices } from "utils/displayAsset"
import { HeaderTotalData } from "./PoolsHeaderTotal"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useTokensBalances } from "api/balances"

export const StablePoolsTotal = () => {
  const { assets } = useRpcProvider()
  const stablepools = useStableswapPools()

  const stablepoolIds =
    stablepools.data?.map((stablepool) => derivePoolAccount(stablepool.id)) ??
    []

  const stablePoolBalances = useAccountsBalances(stablepoolIds)

  const totalBalances =
    stablePoolBalances.data?.reduce<Record<string, BigNumber>>(
      (memo, stablePoolBalance) => {
        stablePoolBalance.balances.forEach((balance) => {
          const id = balance.id.toString()
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
    stablepools.isInitialLoading ||
    stablePoolBalances.isInitialLoading ||
    spotPrices.isInitialLoading
  const total = !spotPrices.isInitialLoading
    ? Object.entries(totalBalances).reduce((memo, totalBalance) => {
        const [assetId, balance] = totalBalance

        const spotPrice =
          spotPrices.data?.find((spotPrices) => spotPrices?.tokenIn === assetId)
            ?.spotPrice ?? BN_1

        const meta = assets.getAsset(assetId)

        const balanceDisplay = balance
          .shiftedBy(-meta.decimals)
          .multipliedBy(spotPrice)

        return memo.plus(balanceDisplay)
      }, BN_0)
    : BN_0

  return <HeaderTotalData isLoading={isLoading} value={total} />
}

export const MyStablePoolsTotal = () => {
  const { account } = useAccount()
  const { assets } = useRpcProvider()
  const stablepools = useStableswapPools()

  const stablepoolIds =
    stablepools.data?.map((stablepool) => stablepool.id) ?? []

  const stablepoolUserPositions = useTokensBalances(
    stablepoolIds,
    account?.address,
  )

  const spotPrices = useDisplayPrices(stablepoolIds)

  const isLoading = stablepools.isInitialLoading || spotPrices.isInitialLoading

  const total = !spotPrices.isInitialLoading
    ? stablepoolUserPositions?.reduce((memo, position) => {
        if (!position.data) return memo
        const { assetId, freeBalance } = position.data

        if (freeBalance.isZero()) return memo

        const spotPrice =
          spotPrices.data?.find(
            (spotPrices) => spotPrices?.tokenIn === assetId.toString(),
          )?.spotPrice ?? BN_1

        const meta = assets.getAsset(assetId.toString())

        const balanceDisplay = freeBalance
          .shiftedBy(-meta.decimals)
          .multipliedBy(spotPrice)

        return memo.plus(balanceDisplay)
      }, BN_0)
    : BN_0

  return <HeaderTotalData isLoading={isLoading} value={total} />
}
