import { usePools, usePoolShareTokens } from "api/pools"
import { getFloatingPointAmount } from "utils/balance"
import { BN_0, BN_1 } from "utils/constants"
import { useMemo } from "react"
import BN from "bignumber.js"
import { useUsdPeggedAsset } from "api/asset"
import { SpotPrice, useSpotPrices } from "api/spotPrice"
import {
  FarmIds,
  getActiveYieldFarms,
  useGlobalFarms,
  useYieldFarms,
} from "api/farms"
import { useQueries } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { useApiPromise } from "utils/api"
import { useTotalIssuances } from "api/totalIssuance"
import { PoolToken } from "@galacticcouncil/sdk"
import { useTokensBalances } from "api/balances"
import { u32 } from "@polkadot/types"
import { useAssetDetailsList } from "api/assetDetails"
import { useAccountStore } from "state/store"

export const useTotalsInPools = () => {
  const pools = usePools()
  const assets = useAssetDetailsList()
  const usd = useUsdPeggedAsset()
  const spotPrices = useSpotPrices(
    assets.data?.map((asset) => asset.id) ?? [],
    usd.data?.id,
  )
  const shareTokens = usePoolShareTokens(
    pools.data?.map((p) => p.address) ?? [],
  )
  const totalIssuances = useTotalIssuances(
    shareTokens.map((q) => q.data?.token),
  )

  const { account } = useAccountStore()
  const balances = useTokensBalances(
    shareTokens.map((st) => st.data?.token).filter((x): x is u32 => !!x) ?? [],
    account?.address,
  )

  const queries = [
    pools,
    assets,
    usd,
    ...balances,
    ...spotPrices,
    ...shareTokens,
    ...totalIssuances,
  ]
  const isLoading = queries.some((q) => q.isInitialLoading)

  const data = useMemo(() => {
    if (
      !pools.data ||
      !assets.data ||
      !usd.data ||
      spotPrices.some((q) => !q.data) ||
      shareTokens.some((q) => !q.data) ||
      totalIssuances.some((q) => !q.data)
    )
      return undefined

    const totals = pools.data.map((pool) => {
      const poolTotal = getPoolTotal(
        pool.tokens,
        spotPrices.map((q) => q.data),
      )

      const token = shareTokens.find((st) => st.data?.poolId === pool.address)
        ?.data?.token
      const issuance = totalIssuances.find((ti) => ti.data?.token === token)
        ?.data?.total
      const balance = balances.find((b) => token?.eq(b.data?.assetId))?.data
        ?.balance

      if (!balance || balance.isZero() || !issuance || issuance.isZero())
        return { poolTotal, userTotal: BN_0 }

      const ratio = balance.div(issuance)
      const userTotal = poolTotal.times(ratio)

      return { poolTotal, userTotal }
    })

    const sum = totals.reduce(
      (acc, curr) => ({
        poolTotal: acc.poolTotal.plus(curr.poolTotal),
        userTotal: acc.userTotal.plus(curr.userTotal),
      }),
      {
        poolTotal: BN_0,
        userTotal: BN_0,
      },
    )

    return sum
  }, [
    pools.data,
    assets.data,
    usd.data,
    balances,
    spotPrices,
    shareTokens,
    totalIssuances,
  ])

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

  const usd = useUsdPeggedAsset()
  const spotPrices = useSpotPrices(
    (pools.data ?? [])
      .map((pool) => pool.tokens)
      .reduce((acc, tokens) => [...acc, ...tokens], [])
      .map((token) => token.id),
    usd.data?.id,
  )

  const queries = [
    pools,
    ...activeYieldFarms,
    globalFarms,
    yieldFarms,
    ...shareTokens,
    ...totalIssuances,
    usd,
    ...spotPrices,
  ]
  const isInitialLoading = queries.some((q) => q.isInitialLoading)

  const data = useMemo(() => {
    if (isInitialLoading) return undefined

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
        )?.data?.token
        const totalIssuance = totalIssuances.find(
          (ti) => ti.data?.token === shareToken,
        )?.data?.total

        const farmIssuance = farm.yieldFarm.totalShares
        const ratio =
          totalIssuance !== undefined && !totalIssuance?.isZero()
            ? farmIssuance.toBigNumber().div(totalIssuance)
            : BN_0

        const farmTotal = poolTotal.times(ratio)

        return farmTotal
      })
      .reduce((acc, t) => acc.plus(t), BN_0)

    return total
  }, [
    farmIds,
    globalFarms.data,
    isInitialLoading,
    pools.data,
    shareTokens,
    spotPrices,
    totalIssuances,
    yieldFarms.data,
  ])

  return { data, isLoading: isInitialLoading }
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
