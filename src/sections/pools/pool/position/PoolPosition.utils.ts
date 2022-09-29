import { useGlobalFarm, useYieldFarm } from "api/farms"
import { useMemo } from "react"
import { subSeconds } from "date-fns"
import { BLOCK_TIME } from "utils/constants"
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

  const farmValue = useMemo(() => {
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

    // console.table([
    //   ["Farm Total Valued Shares", farmTotalValued.toFixed()],
    //   ["Farm Total Shares", farmTotal.toFixed()],
    //   ["Position Valued Shares", positionTotalValued.toFixed()],
    //   ["Position Ratio", positionRatio.toFixed()],
    //   ["Farm Ratio", farmRatio.toFixed()],
    //   ["Pool Total", poolTotal.toFixed()],
    //   ["Farm Value", farmValue.toFixed()],
    //   ["Position Value", positionValue.toFixed()],
    // ])

    return positionValue
  }, [yieldFarm.data, totalIssuance.data, spotPrices, position])

  return { enteredDate, farmValue, isLoading }
}
