import { useGlobalFarm, useYieldFarm } from "api/farms"
import { useMemo } from "react"
import { subSeconds } from "date-fns"
import { BLOCK_TIME, BN_10 } from "utils/constants"
import { PalletLiquidityMiningYieldFarmEntry } from "@polkadot/types/lookup"
import { AccountId32 } from "@polkadot/types/interfaces"
import { useTotalIssuance } from "api/totalIssuance"
import { useTotalInPool } from "sections/pools/pool/Pool.utils"
import { usePoolShareToken } from "api/pools"
import { useTokenBalance } from "api/balances"
import { PoolBase } from "@galacticcouncil/sdk"
import { useAccountStore } from "state/store"
import { getPoolTotal } from "sections/pools/header/PoolsHeader.utils"
import { useAUSD } from "api/asset"
import { useSpotPrices } from "api/spotPrice"
import BN from "bignumber.js"

export const usePoolPositionData = ({
  position,
  pool,
  poolId,
}: {
  position: PalletLiquidityMiningYieldFarmEntry
  pool: PoolBase
  poolId: AccountId32
}) => {
  const globalFarm = useGlobalFarm(position.globalFarmId)
  const yieldFarm = useYieldFarm({
    yieldFarmId: position.yieldFarmId,
    globalFarmId: position.globalFarmId,
    poolId,
  })

  const { account } = useAccountStore()
  const shareToken = usePoolShareToken(pool.address)
  const shareTokenBalance = useTokenBalance(
    shareToken.data?.token,
    account?.address,
  )
  const totalIssuance = useTotalIssuance(shareToken.data?.token)
  const totalInPool = useTotalInPool({ pool })
  const aUSD = useAUSD()
  const spotPrices = useSpotPrices(
    pool.tokens.map((token) => token.id),
    aUSD.data?.token,
  )

  const queries = [
    globalFarm,
    yieldFarm,
    shareToken,
    shareTokenBalance,
    totalIssuance,
    totalInPool,
    aUSD,
    ...spotPrices,
  ]
  const isLoading = queries.some((q) => q.isLoading)

  const enteredDate = useMemo(() => {
    if (!globalFarm.data) return "-"

    const enteredAt = position.enteredAt.toBigNumber()
    const blocksPerPeriod = globalFarm.data.blocksPerPeriod.toBigNumber()
    const blockRange = enteredAt
      .times(blocksPerPeriod)
      .plus(blocksPerPeriod.plus(1))

    const date = subSeconds(Date.now(), blockRange.times(BLOCK_TIME).toNumber())

    return date
  }, [globalFarm.data, position.enteredAt])

  const data = useMemo(() => {
    if (!yieldFarm.data || !totalIssuance.data) return undefined

    const farmTotalValued = yieldFarm.data.totalValuedShares.toBigNumber()
    const farmTotal = yieldFarm.data.totalShares.toBigNumber()
    const positionTotalValued = position.valuedShares.toBigNumber()
    const positionRatio = positionTotalValued.div(farmTotalValued)

    const farmRatio = farmTotal.div(totalIssuance.data.total)
    const poolTotal = getPoolTotal(
      pool.tokens,
      spotPrices.map((sp) => sp.data),
    )

    const farmValue = poolTotal.times(farmRatio)
    const positionValue = farmValue.times(positionRatio)

    const [assetA, assetB] = pool.tokens.map((token) => {
      const balance = new BN(token.balance).div(
        BN_10.pow(new BN(token.decimals)),
      )
      const farmAmount = balance.times(farmRatio)
      const positionAmount = farmAmount.times(positionRatio)

      return { symbol: token.symbol, amount: positionAmount }
    })

    return { positionValue, assetA, assetB }
  }, [yieldFarm.data, totalIssuance.data, spotPrices, position, pool])

  return { ...data, enteredDate, isLoading }
}
