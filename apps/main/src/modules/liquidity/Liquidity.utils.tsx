import {
  omnipoolVolumeQuery,
  omnipoolYieldMetricsQuery,
  stablepoolVolumeQuery,
  stablepoolYieldMetricsQuery,
  xykVolumeQuery,
} from "@galacticcouncil/indexer/squid"
import { OmniMath } from "@galacticcouncil/sdk"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useEffect, useMemo } from "react"

import { XykDeposit } from "@/api/account"
import { AssetType, TAssetData, TErc20 } from "@/api/assets"
import { useOmnipoolAssetsData } from "@/api/omnipool"
import {
  OmniPoolToken,
  PoolBase,
  PoolToken,
  stablePools,
  useXykPools,
  useXykPoolsIds,
} from "@/api/pools"
import { useSquidClient } from "@/api/provider"
import { useAssets, XYKPoolMeta } from "@/providers/assetsProvider"
import {
  AccountOmnipoolPosition,
  useAccountBalances,
  useAccountOmnipoolPositionsData,
  useAccountPositions,
} from "@/states/account"
import { useAssetsPrice } from "@/states/displayAsset"
import {
  setOmnipoolAssets,
  setXYKPools,
  useOmnipoolIds,
  useOmnipoolStablepoolAssets,
} from "@/states/liquidity"
import { scaleHuman } from "@/utils/formatting"
import { toBig } from "@/utils/helpers"

export type OmnipoolAssetTable = {
  id: string
  meta: TAssetData
  price: string | undefined
  tvlDisplay: string | undefined
  lpFeeOmnipool?: string
  lpFeeStablepool?: string
  totalFee?: string
  isFeeLoading: boolean
  isNative: boolean
  isPositions: boolean
  positionsAmount: number
  isStablePool: boolean
  balance: bigint | undefined
  balanceDisplay: string | undefined
  volumeDisplay: string | undefined
  positions: AccountOmnipoolPosition[]
  isVolumeLoading: boolean
  isFarms: boolean
  isStablepoolOnly: boolean
  isStablepoolInOmnipool: boolean
  aStableswapBalance: bigint | undefined
  aStableswapAsset: TErc20 | undefined
}

export type IsolatedPoolTable = {
  id: string
  tokens: PoolToken[]
  tvlDisplay: string
  meta: XYKPoolMeta
  isPositions: boolean
  volumeDisplay: string | undefined
  balance: bigint | undefined
  positionsAmount: number
  price: string | undefined
  shareTokenId: string
  positions: XykDeposit[]
  minTradingLimit: bigint
  isVolumeLoading: boolean
  isFarms: boolean
}

export type TReserve = {
  asset_id: number
  meta: TAssetData
  amount: string
  amountHuman: string
  displayAmount: string | undefined
}

export type TStablepoolData = {
  id: number
  volume: string | undefined
  balance: string
  isStablepool: boolean
  lpFee: string | undefined
  aToken: TErc20 | undefined
}

const isStablepoolData = (
  pool: TStablepoolData | OmniPoolToken,
): pool is TStablepoolData => !!(pool as TStablepoolData).isStablepool

export const useStablepools = () => {
  const squidClient = useSquidClient()
  const { data: pools, isLoading: isPoolsLoading } = useQuery(stablePools)
  const { data: volumes, isLoading: isVolumeLoading } = useQuery(
    stablepoolVolumeQuery(squidClient),
  )
  const { data: yieldMetrics, isLoading: isYieldMetricsLoading } = useQuery(
    stablepoolYieldMetricsQuery(squidClient),
  )
  const { getRelatedAToken } = useAssets()

  const tokensSet = new Set<string>()

  const stablePoolData = pools?.map((stablePool) => {
    const filteredTokens: PoolToken[] = []

    const volume = volumes?.find(
      (volume) => volume.poolId === stablePool.id.toString(),
    )?.poolVolNorm

    stablePool.tokens.forEach((token) => {
      if (token.type !== AssetType.STABLESWAP) {
        tokensSet.add(token.id.toString())
        filteredTokens.push(token)
      }
    })
    return { poolId: stablePool.id, tokens: filteredTokens, volume }
  })

  const { getAssetPrice, isLoading: isPriceLoading } = useAssetsPrice([
    ...tokensSet,
  ])

  const data = stablePoolData?.map((stablepool) => {
    let totalBalance = Big(0)

    const poolId = stablepool.poolId

    stablepool.tokens.forEach((token) => {
      const assetPrice = getAssetPrice(token.id.toString())

      const displayBalance = assetPrice.isValid
        ? Big(scaleHuman(token.balance, token.decimals ?? 0))
            .times(assetPrice.price)
            .toString()
        : undefined

      totalBalance = totalBalance.plus(displayBalance ?? 0)
    })

    const lpFee = yieldMetrics?.find(
      (stablepoolFee) => stablepoolFee.poolId === poolId.toString(),
    )?.projectedApyPerc

    const aToken = getRelatedAToken(poolId.toString())

    const data: TStablepoolData = {
      id: poolId,
      volume: stablepool.volume,
      balance: totalBalance.toFixed(0),
      isStablepool: true,
      lpFee,
      aToken,
    }

    return data
  })

  return {
    data,
    isLoading: isPriceLoading || isPoolsLoading,
    isVolumeLoading,
    isYieldMetricsLoading,
  }
}

export const useOmnipoolStablepools = () => {
  const squidClient = useSquidClient()
  const {
    getAssetWithFallback,
    native: { id: nativeId },
  } = useAssets()
  const { ids: omnipoolIds = [] } = useOmnipoolIds()
  const { data: omnipoolAssets, isLoading: isOmnipoolAssetsLoading } =
    useOmnipoolAssetsData()

  const { getFreeBalance } = useAccountBalances()
  const { getAssetPositions } = useAccountOmnipoolPositionsData()
  const { data: stablepools, isLoading: isStablepoolsLoading } =
    useStablepools()

  const { data: omnipoolVolumes, isLoading: isVolumeLoading } = useQuery(
    omnipoolVolumeQuery(squidClient),
  )

  const { data: yieldMetrics, isLoading: isYieldMetricsLoading } = useQuery(
    omnipoolYieldMetricsQuery(squidClient),
  )

  const stablepoolsIds = useMemo(
    () => stablepools?.map((a) => a.id.toString()) ?? [],
    [stablepools],
  )

  const { getAssetPrice, isLoading: isPriceLoading } = useAssetsPrice([
    ...omnipoolIds,
    ...stablepoolsIds,
  ])

  const isLoading =
    isPriceLoading || isOmnipoolAssetsLoading || isStablepoolsLoading

  const data = useMemo(() => {
    if (isLoading || !omnipoolAssets) return []

    const onlyStablepool: TStablepoolData[] = []
    const stableInOmnipool: Map<string, TStablepoolData> = new Map()

    stablepools?.forEach((stablepoolData) => {
      if (
        !omnipoolAssets.find(
          (asset) =>
            asset.id === stablepoolData.id ||
            asset.id.toString() === stablepoolData.aToken?.id,
        )
      ) {
        onlyStablepool.push(stablepoolData)
      } else {
        stableInOmnipool.set(stablepoolData.id.toString(), stablepoolData)
      }
    })

    const omnipoolData: OmnipoolAssetTable[] = [
      ...omnipoolAssets,
      ...onlyStablepool,
    ].map((pool) => {
      const poolId = pool.id.toString()
      const meta = getAssetWithFallback(poolId)

      const isNative = nativeId === poolId
      const assetPrice = getAssetPrice(poolId)

      const isStablepoolOnly = isStablepoolData(pool)
      const stablepoolInOmnipool = stableInOmnipool.get(poolId)
      const isStablepoolInOmnipool = !!stablepoolInOmnipool
      const isStablePool = isStablepoolOnly || isStablepoolInOmnipool

      const aStableswapAsset = isStablepoolOnly
        ? pool.aToken
        : stablepoolInOmnipool?.aToken
      const aStableswapBalance = aStableswapAsset
        ? getFreeBalance(aStableswapAsset.id.toString())
        : undefined

      let volume: string | undefined
      let lpFeeOmnipool: string | undefined
      let lpFeeStablepool: string | undefined
      let totalFee: string | undefined

      if (isStablepoolOnly) {
        volume = pool.volume
        lpFeeStablepool = pool.lpFee
        totalFee = lpFeeStablepool
      } else {
        const stablepoolVolume = stablepoolInOmnipool?.volume
        lpFeeStablepool = stablepoolInOmnipool?.lpFee

        const omnipoolVolume = omnipoolVolumes?.find(
          (volume) => volume.assetId === poolId,
        )?.assetVolNorm

        volume = Big(stablepoolVolume ?? 0)
          .plus(omnipoolVolume ?? 0)
          .toString()

        lpFeeOmnipool = isNative
          ? undefined
          : yieldMetrics?.find((metric) => metric.assetId === poolId)?.fee

        totalFee =
          lpFeeStablepool || lpFeeOmnipool
            ? Big(lpFeeStablepool ?? 0)
                .plus(lpFeeOmnipool ?? 0)
                .toString()
            : undefined
      }

      const price = assetPrice.isValid
        ? Big(assetPrice.price).round(5).toString()
        : undefined

      const { all: positions } = getAssetPositions(poolId)

      const positionsAmount = positions.length
      const balance = getFreeBalance(poolId)

      const isPositions =
        positionsAmount > 0 || (Big(balance.toString()).gt(0) && isStablePool)

      const tvlDisplay = isStablepoolOnly
        ? pool.balance
        : price
          ? Big(scaleHuman(pool.balance, meta.decimals)).times(price).toString()
          : undefined

      const balanceDisplay = price
        ? Big(scaleHuman(balance, meta.decimals)).times(price).toString()
        : undefined

      return {
        id: poolId,
        meta,
        price,
        tvlDisplay,
        lpFeeOmnipool,
        lpFeeStablepool,
        totalFee,
        isFeeLoading: isYieldMetricsLoading,
        isNative,
        isPositions,
        positionsAmount,
        isStablePool,
        balance,
        balanceDisplay,
        volumeDisplay: volume,
        positions,
        isVolumeLoading,
        isFarms: false,
        isStablepoolOnly,
        isStablepoolInOmnipool,
        aStableswapBalance,
        aStableswapAsset,
      }
    })

    return omnipoolData
  }, [
    getAssetWithFallback,
    getAssetPrice,
    nativeId,
    isLoading,
    getAssetPositions,
    getFreeBalance,
    omnipoolAssets,
    omnipoolVolumes,
    isVolumeLoading,
    isYieldMetricsLoading,
    yieldMetrics,
    stablepools,
  ])

  useEffect(() => {
    setOmnipoolAssets(data, isLoading)
  }, [data, isLoading])
}

export const useIsolatedPools = () => {
  const squidClient = useSquidClient()
  const { data: pools, isLoading: isPoolsLoading } = useXykPools()
  const { getMetaFromXYKPoolTokens } = useAssets()
  const { getPositions } = useAccountPositions()
  const { data: xykPoolsIds, isLoading: isXykPoolsIdsLoading } =
    useXykPoolsIds()
  const { data: xykVolumes, isLoading: isVolumeLoading } = useQuery(
    xykVolumeQuery(squidClient, pools?.map((pool) => pool.address) ?? []),
  )
  const { getFreeBalance } = useAccountBalances()

  const { pricesIds, poolsData } = useMemo(() => {
    const priceIds = new Set<string>()
    const poolsDataArray: {
      spotPriceId: string
      tvl: string
      pool: PoolBase
    }[] = []

    for (const pool of pools ?? []) {
      const { tokens } = pool

      let knownAssetPrice: (typeof tokens)[number] | undefined

      for (const token of tokens) {
        if (priceIds.has(token.id.toString())) {
          knownAssetPrice = token
          break
        }
      }

      if (!knownAssetPrice) {
        knownAssetPrice = tokens[0]
      }

      if (!knownAssetPrice) continue

      const shiftedBalance = scaleHuman(
        knownAssetPrice.balance,
        knownAssetPrice.decimals ?? 0,
      )
      const tvl = Big(shiftedBalance).times(2).toString()

      poolsDataArray.push({
        spotPriceId: knownAssetPrice.id.toString(),
        tvl,
        pool,
      })

      if (!priceIds.has(knownAssetPrice.id.toString())) {
        priceIds.add(knownAssetPrice.id.toString())
      }
    }

    return {
      pricesIds: Array.from(priceIds),
      poolsData: poolsDataArray,
    }
  }, [pools])

  const { getAssetPrice, isLoading: isPriceLoading } = useAssetsPrice(pricesIds)
  const isLoading = isPriceLoading || isPoolsLoading || isXykPoolsIdsLoading

  const data = useMemo(() => {
    if (isLoading) return []

    return poolsData.reduce<IsolatedPoolTable[]>(
      (acc, { pool, tvl, spotPriceId }) => {
        const assetPrice = getAssetPrice(spotPriceId)
        const price = assetPrice.isValid ? assetPrice.price : undefined
        const tvlDisplay = price
          ? (toBig(price)?.times(tvl).toString() ?? "-")
          : "-"

        const meta = getMetaFromXYKPoolTokens(pool.tokens)

        const shareTokenId = xykPoolsIds?.get(pool.address)

        if (!meta || !shareTokenId) return acc

        const { xykMiningPositions } = getPositions(pool.address)

        const volumeDisplay = xykVolumes?.find(
          (volume) => volume.poolId === pool.address,
        )?.poolVolume

        const balance = shareTokenId ? getFreeBalance(shareTokenId) : undefined

        const positionsAmount = Big(xykMiningPositions.length)
          .plus(balance ? 1 : 0)
          .toNumber()

        acc.push({
          id: pool.address,
          tokens: pool.tokens,
          meta,
          tvlDisplay,
          isPositions: positionsAmount > 0,
          positionsAmount,
          volumeDisplay,
          balance,
          price,
          shareTokenId,
          positions: xykMiningPositions,
          minTradingLimit: pool.minTradingLimit,
          isVolumeLoading,
          isFarms: false,
        })

        return acc
      },
      [],
    )
  }, [
    poolsData,
    getAssetPrice,
    getMetaFromXYKPoolTokens,
    getPositions,
    getFreeBalance,
    xykPoolsIds,
    isLoading,
    xykVolumes,
    isVolumeLoading,
  ])

  useEffect(() => {
    setXYKPools({ data, isLoading })
  }, [data, isLoading])
}

export const isIsolatedPool = (
  pool: OmnipoolAssetTable | IsolatedPoolTable,
): pool is IsolatedPoolTable => {
  return "tokens" in pool
}

export const useOmnipoolCapacity = (id: string) => {
  const {
    dataMap: omnipoolAssets,
    hubToken,
    isLoading,
  } = useOmnipoolAssetsData()

  const data = useMemo(() => {
    if (!omnipoolAssets || !hubToken) return null

    const asset = omnipoolAssets.get(Number(id))

    if (!asset || !hubToken) return null

    const assetReserve = asset.balance.toString()
    const assetHubReserve = asset.hubReserves.toString()
    const assetCap = asset.cap.toString()
    const totalHubReserve = hubToken.balance.toString()

    const capDifference = OmniMath.calculateCapDifference(
      assetReserve,
      assetHubReserve,
      assetCap,
      totalHubReserve,
    )

    if (capDifference === "-1") return null

    const capacity = scaleHuman(
      Big(assetReserve).plus(capDifference).toString(),
      asset.decimals ?? 0,
    )
    const filled = scaleHuman(assetReserve, asset.decimals ?? 0)
    const filledPercent = Big(filled).div(capacity).times(100).toString()

    return { capacity, filled, filledPercent }
  }, [hubToken, id, omnipoolAssets])

  return { data, isLoading }
}

export const useStablepoolReserves = (stablepoolId?: string) => {
  const { getAssetWithFallback } = useAssets()
  const { data: pools = [], isLoading: isPoolsLoading } = useQuery(stablePools)

  const stablepool = pools.find(
    (stablePool) => stablePool.id.toString() === stablepoolId,
  )

  const stablepoolAssets = useMemo(
    () =>
      stablepool?.tokens.filter(
        (token) =>
          token.type === AssetType.TOKEN || token.type === AssetType.ERC20,
      ) ?? [],
    [stablepool],
  )

  const assetIds = stablepoolAssets.map((asset) => asset.id.toString())

  const { getAssetPrice, isLoading: isAssetsLoading } = useAssetsPrice(assetIds)

  const reserves = useMemo(
    (): TReserve[] =>
      stablepoolAssets.map((token) => {
        const id = token.id.toString()
        const meta = getAssetWithFallback(id)

        const amountHuman = scaleHuman(token.balance, meta.decimals)
        const assetPrice = getAssetPrice(id)

        return {
          asset_id: Number(id),
          meta,
          amount: token.balance.toString(),
          amountHuman,
          displayAmount: assetPrice.isValid
            ? toBig(assetPrice.price)?.times(amountHuman).toString()
            : undefined,
        }
      }),
    [stablepoolAssets, getAssetWithFallback, getAssetPrice],
  )

  const totalDisplayAmount = reserves.reduce(
    (t, asset) =>
      Big(t)
        .plus(asset.displayAmount ?? 0)
        .toString(),
    "0",
  )

  return {
    pegs: [],
    totalIssuance: stablepool?.totalIssuance,
    reserves,
    stablepoolAssets,
    assetIds,
    totalDisplayAmount,
    isLoading: isPoolsLoading || isAssetsLoading,
  }
}

export const useOmnipoolShare = (id: string) => {
  const {
    data: omnipoolAssets = [],
    getOmnipoolAsset,
    isLoading: isOmnipoolAssetsLoading,
  } = useOmnipoolStablepoolAssets()

  const balance = getOmnipoolAsset(id)?.tvlDisplay

  const omnipoolShare = balance
    ? Big(balance)
        .div(
          omnipoolAssets.reduce(
            (acc, asset) => acc.plus(asset.tvlDisplay ?? 0),
            Big(0),
          ),
        )
        .times(100)
        .toString()
    : undefined

  return { omnipoolShare, isLoading: isOmnipoolAssetsLoading }
}

export const isValidStablepoolToken = (token: PoolToken) => {
  return token.type === AssetType.TOKEN || token.type === AssetType.ERC20
}
