import {
  calculate_liquidity_lrna_out,
  calculate_liquidity_out,
} from "@galacticcouncil/math-omnipool"
import { useQueries } from "@tanstack/react-query"
import { useTokensBalances } from "api/balances"
import { useApiIds } from "api/consts"
import { FarmIds, getActiveYieldFarms, useYieldFarms } from "api/farms"
import { useOmnipoolAssets, useOmnipoolPositions } from "api/omnipool"
import { useUniques } from "api/uniques"
import BN from "bignumber.js"
import { useMemo } from "react"
import { useAccountStore } from "state/store"
import { OMNIPOOL_ACCOUNT_ADDRESS } from "utils/api"
import { getFloatingPointAmount } from "utils/balance"
import { BN_0, BN_10, BN_NAN } from "utils/constants"
import { useDisplayPrice, useDisplayPrices } from "utils/displayAsset"
import { isNotNil } from "utils/helpers"
import { QUERY_KEYS } from "utils/queryKeys"
import { useRpcProvider } from "providers/rpcProvider"

export const useOmnipoolTotal = () => {
  const { assets } = useRpcProvider()
  const omnipoolAssets = useOmnipoolAssets()

  const balances = useTokensBalances(
    omnipoolAssets.data?.map((a) => a.id.toString()) ?? [],
    OMNIPOOL_ACCOUNT_ADDRESS,
  )
  const spotPrices = useDisplayPrices(
    omnipoolAssets.data?.map((a) => a.id.toString()) ?? [],
  )

  const queries = [omnipoolAssets, ...balances, spotPrices]
  const isLoading = queries.some((q) => q.isLoading)

  const data = useMemo(() => {
    if (
      !omnipoolAssets.data ||
      !spotPrices.data ||
      balances.some((q) => !q.data)
    )
      return undefined

    const total = omnipoolAssets.data
      .map((asset) => {
        const id = asset.id.toString()
        const meta = assets.getAsset(id)
        const balance = balances.find((b) => b.data?.assetId.toString() === id)
        const sp = spotPrices.data?.find((sp) => sp?.tokenIn === id)

        if (!meta || !balance?.data?.balance || !sp?.spotPrice) return BN_0

        const dp = BN_10.pow(meta.decimals)
        const value = balance.data.balance.times(sp?.spotPrice).div(dp)
        console.log(value.toString(), meta.symbol, "value")
        return value
      })
      .reduce((acc, curr) => acc.plus(curr), BN_0)

    return total
  }, [omnipoolAssets.data, spotPrices.data, balances, assets])

  return { data, isLoading }
}

export const useUsersTotalInPools = () => {
  const { account } = useAccountStore()
  const { assets } = useRpcProvider()
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

  const omnipoolAssets = useOmnipoolAssets()
  const omnipoolBalances = useTokensBalances(assetIds, OMNIPOOL_ACCOUNT_ADDRESS)
  const spotPrices = useDisplayPrices([apiIds.data?.hubId ?? "", ...assetIds])

  const queries = [
    apiIds,
    uniques,
    spotPrices,
    omnipoolAssets,
    ...positions,
    ...omnipoolBalances,
  ]
  const isLoading = queries.some((q) => q.isLoading)

  const data = useMemo(() => {
    if (
      !apiIds.data ||
      !uniques.data ||
      !omnipoolAssets.data ||
      !spotPrices.data ||
      positions.some((q) => !q.data) ||
      omnipoolBalances.some((q) => !q.data)
    )
      return undefined

    const totals = positions.map((query) => {
      if (!query.data) return BN_NAN

      const position = query.data

      const meta = assets.getAsset(position.assetId.toString())
      const lrnaMeta = assets.getAsset(apiIds.data.hubId)

      const omnipoolAsset = omnipoolAssets.data.find(
        (a) => a.id.toString() === position.assetId.toString(),
      )
      const omnipoolBalance = omnipoolBalances.find(
        (b) => b.data?.assetId.toString() === position.assetId.toString(),
      )

      if (!meta || !lrnaMeta || !omnipoolAsset?.data || !omnipoolBalance?.data)
        return BN_0

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

      const lrnaSp = spotPrices.data?.find(
        (sp) => sp?.tokenIn === apiIds.data.hubId,
      )

      const lrnaDp = BN_10.pow(lrnaMeta.decimals)

      const lrna =
        lernaOutResult !== "-1" ? new BN(lernaOutResult).div(lrnaDp) : BN_0

      const valueSp = spotPrices.data?.find((sp) => sp?.tokenIn === id)
      const valueDp = BN_10.pow(meta.decimals)

      const value = new BN(liquidityOutResult).div(valueDp)

      if (!valueSp?.spotPrice) return BN_0

      let valueDisplay = value.times(valueSp.spotPrice)

      if (lrna.gt(0)) {
        valueDisplay = !lrnaSp
          ? BN_NAN
          : valueDisplay.plus(lrna.times(lrnaSp.spotPrice))
      }

      return valueDisplay
    })

    return totals.reduce((acc, total) => acc.plus(total), BN_0)
  }, [
    apiIds.data,
    uniques.data,
    omnipoolAssets.data,
    spotPrices.data,
    positions,
    omnipoolBalances,
    assets,
  ])

  return { data, isLoading }
}

export const useTotalInFarms = () => {
  const { api } = useRpcProvider()
  const pools = { data: [] }

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

  const lrnaSpotPrice = useDisplayPrice(apiIds.data?.hubId ?? "")

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
