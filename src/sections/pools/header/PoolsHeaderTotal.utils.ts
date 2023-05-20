import {
  calculate_liquidity_lrna_out,
  calculate_liquidity_out,
} from "@galacticcouncil/math-omnipool"
import { useQueries } from "@tanstack/react-query"
import { useAssetMetaList } from "api/assetMeta"
import { useTokensBalances } from "api/balances"
import { useApiIds } from "api/consts"
import { FarmIds, getActiveYieldFarms, useYieldFarms } from "api/farms"
import { useOmnipoolAssets, useOmnipoolPositions } from "api/omnipool"
import { useSpotPrice, useSpotPrices } from "api/spotPrice"
import { useUniques } from "api/uniques"
import BN from "bignumber.js"
import { useMemo } from "react"
import { useAccountStore } from "state/store"
import { OMNIPOOL_ACCOUNT_ADDRESS, useApiPromise } from "utils/api"
import { getFloatingPointAmount } from "utils/balance"
import { BN_0, BN_10, BN_NAN } from "utils/constants"
import { useDisplayAssetStore } from "utils/displayAsset"
import { isNotNil } from "utils/helpers"
import { QUERY_KEYS } from "utils/queryKeys"
import { useOmnipoolPools } from "../PoolsPage.utils"

export const useTotalInPools = () => {
  // const apiIds = useApiIds()
  const displayAsset = useDisplayAssetStore()
  const assets = useOmnipoolAssets()
  const metas = useAssetMetaList([
    displayAsset.id,
    ...(assets.data?.map((a) => a.id) ?? []),
  ])
  const balances = useTokensBalances(
    assets.data?.map((a) => a.id.toString()) ?? [],
    OMNIPOOL_ACCOUNT_ADDRESS,
  )
  const spotPrices = useSpotPrices(
    assets.data?.map((a) => a.id) ?? [],
    displayAsset.id,
  )

  const queries = [assets, metas, ...balances, ...spotPrices]
  const isLoading = queries.some((q) => q.isInitialLoading)

  const data = useMemo(() => {
    if (
      !assets.data ||
      !metas.data ||
      balances.some((q) => !q.data) ||
      spotPrices.some((q) => !q.data)
    )
      return undefined

    const total = assets.data
      .map((asset) => {
        const id = asset.id.toString()
        const meta = metas.data.find((m) => m.id === id)
        const balance = balances.find((b) => b.data?.assetId.toString() === id)
        const sp = spotPrices.find((sp) => sp.data?.tokenIn === id)

        if (!meta || !balance?.data?.balance || !sp?.data?.spotPrice)
          return BN_0

        const dp = BN_10.pow(meta.decimals.toString())
        const value = balance.data.balance.times(sp?.data?.spotPrice).div(dp)

        return value
      })
      .reduce((acc, curr) => acc.plus(curr), BN_0)

    return total
  }, [assets.data, metas.data, balances, spotPrices])

  return { data, isLoading }
}

export const useUsersTotalInPools = () => {
  const { account } = useAccountStore()
  const apiIds = useApiIds()
  const uniques = useUniques(
    account?.address ?? "",
    apiIds.data?.omnipoolCollectionId ?? "",
  )
  const positions = useOmnipoolPositions(
    uniques.data?.map((u) => u.itemId) ?? [],
  )
  const assetIds =
    positions.map((p) => p.data?.assetId.toString()).filter(isNotNil) ?? []
  const metas = useAssetMetaList([
    apiIds.data?.stableCoinId.toString(),
    apiIds.data?.hubId,
    ...assetIds,
  ])
  const omnipoolAssets = useOmnipoolAssets()
  const omnipoolBalances = useTokensBalances(assetIds, OMNIPOOL_ACCOUNT_ADDRESS)
  const spotPrices = useSpotPrices(
    [apiIds.data?.hubId, ...assetIds],
    apiIds.data?.stableCoinId,
  )

  const queries = [
    apiIds,
    uniques,
    metas,
    omnipoolAssets,
    ...positions,
    ...omnipoolBalances,
    ...spotPrices,
  ]
  const isLoading = queries.some((q) => q.isInitialLoading)

  const data = useMemo(() => {
    if (
      !apiIds.data ||
      !uniques.data ||
      !metas.data ||
      !omnipoolAssets.data ||
      positions.some((q) => !q.data) ||
      omnipoolBalances.some((q) => !q.data) ||
      spotPrices.some((q) => !q.data)
    )
      return undefined

    const totals = positions.map((query) => {
      if (!query.data) return BN_NAN

      const position = query.data

      const meta = metas.data.find(
        (m) => m.id.toString() === position.assetId.toString(),
      )

      const lrnaMeta = metas.data.find(
        (m) => m.id.toString() === apiIds.data.hubId,
      )

      const omnipoolAsset = omnipoolAssets.data.find(
        (a) => a.id.toString() === position.assetId.toString(),
      )
      const omnipoolBalance = omnipoolBalances.find(
        (b) => b.data?.assetId.toString() === position.assetId.toString(),
      )

      if (!meta || !omnipoolAsset?.data || !omnipoolBalance?.data) return BN_0

      const id = position.assetId.toString()

      const [nom, denom] = position.price.map((n) => new BN(n.toString()))
      const price = nom.div(denom)
      const positionPrice = price.times(BN_10.pow(18))

      const params: Parameters<typeof calculate_liquidity_out> = [
        omnipoolBalance.data.balance.toString(),
        omnipoolAsset.data.hubReserve.toString(),
        omnipoolAsset.data.shares.toString(),
        position.amount.toString(),
        position.shares.toString(),
        positionPrice.toFixed(0),
        position.shares.toString(),
        "0", // fee zero
      ]

      const liquidityOutResult = calculate_liquidity_out.apply(this, params)
      const lernaOutResult = calculate_liquidity_lrna_out.apply(this, params)

      if (liquidityOutResult === "-1") return BN_0

      const lrnaSp = spotPrices.find(
        (sp) => sp.data?.tokenIn === apiIds.data.hubId,
      )

      const lrnaDp = BN_10.pow(lrnaMeta?.decimals.toNumber() ?? 12)

      const lrna =
        lernaOutResult !== "-1" ? new BN(lernaOutResult).div(lrnaDp) : BN_0

      const valueSp = spotPrices.find((sp) => sp.data?.tokenIn === id)
      const valueDp = BN_10.pow(meta.decimals.toBigNumber())

      const value = new BN(liquidityOutResult).div(valueDp)

      if (!valueSp?.data?.spotPrice) return BN_0

      let valueUSD = value.times(valueSp.data.spotPrice)

      if (lrna.gt(0)) {
        valueUSD = !lrnaSp?.data
          ? BN_NAN
          : valueUSD.plus(lrna.times(lrnaSp.data.spotPrice))
      }

      return valueUSD
    })

    return totals.reduce((acc, total) => acc.plus(total), BN_0)
  }, [
    uniques.data,
    positions,
    metas.data,
    omnipoolAssets.data,
    apiIds.data,
    omnipoolBalances,
    spotPrices,
  ])

  return { data, isLoading }
}

export const useTotalInFarms = () => {
  const api = useApiPromise()
  const pools = useOmnipoolPools()

  const apiIds = useApiIds()
  const poolIds = pools.data?.map((pool) => pool.id) ?? []

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

  const yieldFarms = useYieldFarms(farmIds)

  const lrnaSpotPrice = useSpotPrice(
    apiIds.data?.hubId,
    apiIds.data?.stableCoinId,
  )

  const result = farmIds.reduce((memo, farmId) => {
    const yieldFarm = yieldFarms.data?.find(
      (yieldFarm) => yieldFarm.id.toString() === farmId.yieldFarmId.toString(),
    )

    if (yieldFarm && lrnaSpotPrice?.data) {
      // totalValuedShares is a lerna asset
      const resultTest = yieldFarm.totalValuedShares
        .toBigNumber()
        .times(lrnaSpotPrice.data?.spotPrice)

      return memo.plus(getFloatingPointAmount(resultTest ?? BN_0, 12))
    }

    return memo
  }, BN_0)

  const isLoading =
    activeYieldFarms.some((farm) => farm.isLoading) ||
    yieldFarms.isLoading ||
    lrnaSpotPrice.isLoading

  return {
    data: result,
    isLoading,
  }
}
