import { usePools, usePoolShareTokens } from "api/pools"
import { getFloatingPointAmount } from "utils/balance"
import { BN_0, BN_1 } from "utils/constants"
import { useMemo } from "react"
import BN from "bignumber.js"
import { useAssets, useAUSD } from "api/asset"
import { SpotPrice, useSpotPrices } from "api/spotPrice"
import {
  FarmIds,
  getActiveYieldFarms,
  useGlobalFarms,
  useYieldFarms,
} from "api/farms"
import { useQueries } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { useApiPromise } from "utils/network"
import { useTotalIssuances } from "api/totalIssuance"
import { PoolToken } from "@galacticcouncil/sdk"

export const useTotalInPools = () => {
  const pools = usePools()
  const assets = useAssets()
  const aUSD = useAUSD()
  const spotPrices = useSpotPrices(
    assets.data?.map((asset) => asset.token) ?? [],
    aUSD.data?.token,
  )

  const queries = [pools, assets, aUSD, ...spotPrices]
  const isLoading = queries.some((q) => q.isLoading)

  const data = useMemo(() => {
    if (isLoading) return undefined

    const totals = pools.data?.map((pool) =>
      getPoolTotal(
        pool.tokens,
        spotPrices.map((q) => q.data),
      ),
    )
    const total = totals?.reduce((acc, total) => acc.plus(total), BN_0)

    return total ?? BN_0
  }, [isLoading, pools.data, spotPrices])

  return { data, isLoading }
}

export const useTotalInFarms = () => {
  const api = useApiPromise()

  const pools = usePools()
  const poolIds = (pools.data ?? []).map((pool) => pool.address)

  const activeYieldFarms = useQueries({
    queries: poolIds.map((id) => ({
      queryKey: QUERY_KEYS.activeYieldFarms(id),
      queryFn: getActiveYieldFarms(api, id),
      enabled: !!pools.data?.length,
    })),
  })
  const farmIds = activeYieldFarms
    .map((farms) => farms.data)
    .filter((x): x is FarmIds[] => !!x)
    .reduce((acc, curr) => [...acc, ...curr], [])

  const globalFarms = useGlobalFarms(farmIds.map((farm) => farm.globalFarmId))
  const yieldFarms = useYieldFarms(farmIds)

  const shareTokens = usePoolShareTokens(poolIds)
  const totalIssuances = useTotalIssuances(
    shareTokens.map((q) => q.data?.token),
  )

  const aUSD = useAUSD()
  const spotPrices = useSpotPrices(
    (pools.data ?? [])
      .map((pool) => pool.tokens)
      .reduce((acc, tokens) => [...acc, ...tokens], [])
      .map((token) => token.id),
    aUSD.data?.token,
  )

  const queries = [
    pools,
    ...activeYieldFarms,
    globalFarms,
    yieldFarms,
    ...shareTokens,
    ...totalIssuances,
    aUSD,
    ...spotPrices,
  ]
  const isLoading = queries.some((q) => q.isLoading)

  const data = useMemo(() => {
    if (isLoading) return undefined

    const mappedFarms = farmIds.map((ids) => {
      const globalFarm = globalFarms.data?.find((gf) =>
        ids.globalFarmId.eq(gf.id),
      )
      const yieldFarm = yieldFarms.data?.find((yf) => ids.yieldFarmId.eq(yf.id))
      const pool = pools.data?.find((pool) => ids.poolId.eq(pool.address))

      if (!globalFarm || !yieldFarm || !pool) return undefined

      return { globalFarm, yieldFarm, pool }
    })
    const farms = mappedFarms.filter(
      (x): x is NonNullable<typeof mappedFarms[number]> => x != null,
    )

    const total = farms
      .map((farm) => {
        const poolTotal = getPoolTotal(
          farm.pool.tokens,
          spotPrices.map((sp) => sp.data),
        )
        const shareToken = shareTokens.find(
          (st) => farm.pool.address === st.data?.poolId,
        )
        const totalIssuance = totalIssuances.find((ti) =>
          ti.data?.token?.eq(shareToken?.data?.token),
        )
        const farmIssuance = farm.yieldFarm.totalShares
        const ratio = farmIssuance
          .toBigNumber()
          .div(totalIssuance?.data?.total ?? BN_1)

        return poolTotal.times(ratio)
      })
      .reduce((acc, t) => acc.plus(t), BN_0)

    return total
  }, [
    farmIds,
    globalFarms.data,
    isLoading,
    pools.data,
    shareTokens,
    spotPrices,
    totalIssuances,
    yieldFarms.data,
  ])

  return { data, isLoading }
}

export const getPoolTotal = (
  tokens: PoolToken[],
  spotPrices: (SpotPrice | undefined)[],
) => {
  const total = tokens.reduce((acc, token) => {
    const amount = getFloatingPointAmount(new BN(token.balance), token.decimals)
    const spotPrice = spotPrices.find((sp) => sp?.tokenIn === token.id)
    const total = amount.times(spotPrice?.spotPrice ?? BN_0)

    return acc.plus(total)
  }, BN_0)

  return total
}
