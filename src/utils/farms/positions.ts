import { useMemo } from "react"
import { getPoolTotal } from "sections/pools/header/PoolsHeader.utils"
import { BN_0 } from "utils/constants"
import { useYieldFarms } from "api/farms"
import { usePools, usePoolShareTokens } from "api/pools"
import { useTotalIssuances } from "api/totalIssuance"
import { useUsdPeggedAsset } from "api/asset"
import { useSpotPrices } from "api/spotPrice"
import { useAllUserDeposits } from "utils/farms/deposits"

export const useTotalInPositions = () => {
  const deposits = useAllUserDeposits()

  const pools = usePools()
  const yieldFarms = useYieldFarms(
    deposits.data?.positions?.map(
      ({ position: { yieldFarmId, globalFarmId }, poolId }) => ({
        yieldFarmId: yieldFarmId,
        globalFarmId: globalFarmId,
        poolId,
      }),
    ) ?? [],
  )
  const shareTokens = usePoolShareTokens(
    deposits.data?.deposits?.map(({ deposit }) => deposit.ammPoolId) ?? [],
  )
  const totalIssuances = useTotalIssuances(
    shareTokens.map((st) => st.data?.token),
  )
  const usd = useUsdPeggedAsset()
  const spotPrices = useSpotPrices(
    pools.data?.map((pool) => pool.tokens.map((token) => token.id)).flat(2) ??
      [],
    usd.data?.id,
  )

  const queries = [
    deposits,
    pools,
    yieldFarms,
    ...shareTokens,
    ...totalIssuances,
    usd,
    ...spotPrices,
  ]
  const isLoading = queries.some((q) => q.isInitialLoading)

  const data = useMemo(() => {
    if (
      !deposits.data.deposits ||
      !deposits.data.positions ||
      !pools.data ||
      !yieldFarms.data ||
      !usd.data ||
      shareTokens.some((q) => !q.data) ||
      totalIssuances.some((q) => !q.data) ||
      spotPrices.some((q) => !q.data)
    )
      return undefined

    const values = deposits.data.positions
      .map(({ position, poolId }) => {
        const yieldFarm = yieldFarms.data?.find((yf) =>
          yf.id.eq(position.yieldFarmId),
        )
        const pool = pools.data?.find((p) => poolId.eq(p.address))
        const shareToken = shareTokens.find(
          (st) => st.data?.poolId.toString() === pool?.address,
        )
        const totalIssuance = totalIssuances.find((ti) =>
          ti.data?.token.eq(shareToken?.data?.token),
        )

        if (!yieldFarm || !totalIssuance?.data || !pool) return BN_0

        const farmTotalValued = yieldFarm.totalValuedShares.toBigNumber()
        const farmTotal = yieldFarm?.totalShares.toBigNumber()
        const positionTotalValued = position.valuedShares.toBigNumber()
        const positionRatio = positionTotalValued.div(farmTotalValued)

        const farmRatio = farmTotal.div(totalIssuance.data.total)
        const poolTotal = getPoolTotal(
          pool.tokens,
          spotPrices.map((sp) => sp.data),
        )

        const farmValue = poolTotal.times(farmRatio)
        const positionValue = farmValue.times(positionRatio)

        return positionValue
      })
      .reduce((acc, value) => acc.plus(value), BN_0)

    return values
  }, [
    deposits.data.deposits,
    deposits.data.positions,
    pools.data,
    usd.data,
    yieldFarms,
    shareTokens,
    totalIssuances,
    spotPrices,
  ])

  return { data, isLoading }
}
