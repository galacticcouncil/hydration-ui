import { useGlobalFarm, useYieldFarm } from "api/farms"
import { useMemo } from "react"
import { subSeconds } from "date-fns"
import { BLOCK_TIME, BN_1, BN_10 } from "utils/constants"
import { PalletLiquidityMiningYieldFarmEntry } from "@polkadot/types/lookup"
import { useTotalIssuance } from "api/totalIssuance"
import { useTotalInPool } from "sections/pools/pool/Pool.utils"
import { usePoolShareToken } from "api/pools"
import { PoolBase } from "@galacticcouncil/sdk"
import { getPoolTotal } from "sections/pools/header/PoolsHeader.utils"
import { useAsset, useAUSD } from "api/asset"
import { useSpotPrices } from "api/spotPrice"
import BN from "bignumber.js"
import { useBestNumber } from "api/chain"
import { useMath } from "utils/math"

export const usePoolPositionData = ({
  position,
  pool,
}: {
  position: PalletLiquidityMiningYieldFarmEntry
  pool: PoolBase
}) => {
  const globalFarm = useGlobalFarm(position.globalFarmId)
  const yieldFarm = useYieldFarm({
    yieldFarmId: position.yieldFarmId,
    globalFarmId: position.globalFarmId,
    poolId: pool.address,
  })

  const shareToken = usePoolShareToken(pool.address)
  const totalIssuance = useTotalIssuance(shareToken.data?.token)
  const totalInPool = useTotalInPool({ pool })
  const aUSD = useAUSD()
  const spotPrices = useSpotPrices(
    pool.tokens.map((token) => token.id),
    aUSD.data?.id,
  )

  const rewardAsset = useAsset(globalFarm.data?.rewardCurrency)
  const bestNumber = useBestNumber()
  const math = useMath()

  const queries = [
    globalFarm,
    yieldFarm,
    shareToken,
    totalIssuance,
    totalInPool,
    aUSD,
    rewardAsset,
    bestNumber,
    math,
    ...spotPrices,
  ]
  const isLoading = queries.some((q) => q.isLoading)

  const mined = useMemo(() => {
    if (
      bestNumber.data == null ||
      math.liquidityMining == null ||
      globalFarm.data == null ||
      yieldFarm.data == null
    )
      return null

    const currentPeriod = bestNumber.data.relaychainBlockNumber
      .toBigNumber()
      .dividedToIntegerBy(globalFarm.data.blocksPerPeriod.toBigNumber())

    const periods = currentPeriod.minus(position.enteredAt.toBigNumber())

    let loyaltyMultiplier = BN_1.toString()

    if (!yieldFarm.data.loyaltyCurve.isNone) {
      const { initialRewardPercentage, scaleCoef } =
        yieldFarm.data.loyaltyCurve.unwrap()

      loyaltyMultiplier = math.liquidityMining.calculate_loyalty_multiplier(
        periods.toFixed(),
        initialRewardPercentage.toBigNumber().toFixed(),
        scaleCoef.toBigNumber().toFixed(),
      )
    }

    return new BN(
      math.liquidityMining.calculate_user_reward(
        position.accumulatedRpvs.toBigNumber().toFixed(),
        position.valuedShares.toBigNumber().toFixed(),
        position.accumulatedClaimedRewards.toBigNumber().toFixed(),
        yieldFarm.data.accumulatedRpvs.toBigNumber().toFixed(),
        loyaltyMultiplier,
      ),
    )
  }, [
    bestNumber.data,
    globalFarm.data,
    math.liquidityMining,
    position.accumulatedClaimedRewards,
    position.accumulatedRpvs,
    position.enteredAt,
    position.valuedShares,
    yieldFarm.data,
  ])

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

  return {
    ...data,
    enteredDate,
    mined,
    rewardAsset: rewardAsset.data,
    isLoading,
  }
}
