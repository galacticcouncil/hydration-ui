import {
  AggregationTimeRange,
  platformTotalQuery,
  TimeSeriesBucketTimeRange,
  tradePricesQuery,
  xykVolumeQuery,
} from "@galacticcouncil/indexer/squid"
import { getGhoReserve } from "@galacticcouncil/money-market/utils"
import {
  isValidBigSource,
  safeConvertPublicKeyToSS58,
  safeConvertSS58toPublicKey,
} from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useMemo } from "react"

import { useBorrowReserves } from "@/api/borrow"
import { useGigaApr } from "@/api/gigaApr"
import { gigaTotalLockedQuery } from "@/api/gigaStake"
import { useXykPools } from "@/api/pools"
import { useSquidClient } from "@/api/provider"
import {
  calculateTotalTVL,
  defillamaHydrationTvlHistoryQuery,
  useFeesChartsData,
  useOmnipoolTVL,
  useXYKPools,
} from "@/api/stats"
import { useStakingSupply } from "@/modules/staking/DashboardStats.data"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAssetPrice, useDisplayAssetStore } from "@/states/displayAsset"
import { NATIVE_ASSET_ID } from "@/utils/consts"
import { scaleHuman } from "@/utils/formatting"

const getNumber = (value?: string | null) => Number(value ?? 0) || 0

export const useAggregatedPlatformStats = () => {
  const rpc = useRpcProvider()
  const { native } = useAssets()
  const squidClient = useSquidClient()
  const displayAssetId = useDisplayAssetStore((state) => state.stableCoinId)

  // TVL sources
  const { data: platformTotal, isLoading: isPlatformTotalLoading } = useQuery(
    platformTotalQuery(squidClient),
  )
  const { data: omnipoolData, isLoading: isOmniLoading } = useOmnipoolTVL(1000)
  const { data: xykData, isLoading: isXykLoading } = useXYKPools(50)
  const { data: borrowReserves, isLoading: isReservesLoading } =
    useBorrowReserves()
  const { data: defillamaTvlHistory, isLoading: isDefillamaTvlLoading } =
    useQuery(defillamaHydrationTvlHistoryQuery())

  // Volume sources
  const { data: xykPools, isLoading: isXykPoolsLoading } = useXykPools()
  const { data: xykVolumes, isLoading: isXykVolumesLoading } = useQuery(
    xykVolumeQuery(squidClient, xykPools?.map((pool) => pool.address) ?? []),
  )
  const { data: omnipoolVolumes7d, isLoading: isOmnipoolVolumes7dLoading } =
    useQuery({
      queryKey: ["statsOverviewOmnipoolVolumes", AggregationTimeRange["7D"]],
      queryFn: async () => {
        const data = await squidClient.OmnipoolVolume({
          filter: {
            period: AggregationTimeRange["7D"],
          },
        })

        return data.omnipoolAssetVolumeHistoricalDataByPeriod.nodes
          .filter((node) => node !== null)
          .map((node) => ({
            assetVolNorm: Number(node.assetVolNormalized).toFixed(2),
          }))
      },
    })
  const { data: stablepoolVolumes7d, isLoading: isStablepoolVolumes7dLoading } =
    useQuery({
      queryKey: ["statsOverviewStablepoolVolumes", AggregationTimeRange["7D"]],
      queryFn: async () => {
        const data = await squidClient.StablepoolVolume({
          filter: {
            period: AggregationTimeRange["7D"],
          },
        })

        return data.stableswapVolumeHistoricalDataByPeriod.nodes
          .filter((node) => node !== null)
          .map((node) => ({
            poolVolNorm: node.poolVolNorm,
          }))
      },
    })
  const xykPoolAddresses = xykPools?.map((pool) => pool.address) ?? []
  const { data: xykVolumes7d, isLoading: isXykVolumes7dLoading } = useQuery({
    queryKey: [
      "statsOverviewXykVolumes",
      xykPoolAddresses,
      AggregationTimeRange["7D"],
    ],
    queryFn: async () => {
      const data = await squidClient.XykVolume({
        filter: {
          poolIds: xykPoolAddresses.map((address) =>
            safeConvertSS58toPublicKey(address),
          ),
          period: AggregationTimeRange["7D"],
        },
      })

      return data.xykpoolVolumeHistoricalDataByPeriod.nodes
        .filter((node) => node !== null)
        .map((node) => ({
          poolId: safeConvertPublicKeyToSS58(node.poolId),
          poolVolume: Number(node.assetAVolNorm).toFixed(2),
        }))
    },
    enabled: !!xykPoolAddresses.length,
  })

  // Fees / Revenue
  const { data: feesChartsData, isLoading: isFeesLoading } = useFeesChartsData({
    viewMode: "protocol",
    timeRange: "1W",
  })

  // HDX Price
  const { price: hdxSpotPrice, isLoading: isPriceLoading } =
    useAssetPrice(NATIVE_ASSET_ID)
  const hdxPriceRange = useMemo(() => {
    const now = Date.now()
    return {
      startTimestamp: String(now - 24 * 60 * 60 * 1000),
      endTimestamp: String(now),
      bucketSize: TimeSeriesBucketTimeRange["1H"],
    }
  }, [])

  const assetInId = displayAssetId ?? ""
  const assetOutId = NATIVE_ASSET_ID
  const sortedAssets =
    Number(assetOutId) >= Number(assetInId)
      ? ([assetInId, assetOutId] as const)
      : ([assetOutId, assetInId] as const)
  const isAssetInFirst = sortedAssets[0] === assetInId
  const { data: hdxPriceData, isLoading: isHdxPriceDataLoading } = useQuery({
    ...tradePricesQuery(
      squidClient,
      sortedAssets[0],
      sortedAssets[1],
      hdxPriceRange.startTimestamp,
      hdxPriceRange.endTimestamp,
      hdxPriceRange.bucketSize,
    ),
    enabled: !!displayAssetId,
  })

  // GIGAHDX staking
  const { total: gigaProjectedApr, isLoading: isGigaAprLoading } = useGigaApr()
  const { data: gigaLockedHDX, isLoading: isGigaLockedHDXLoading } = useQuery(
    gigaTotalLockedQuery(rpc),
  )
  const { circulatingSupply, isLoading: isStakingSupplyLoading } =
    useStakingSupply()

  const isLoading =
    isPlatformTotalLoading ||
    isOmniLoading ||
    isXykLoading ||
    isReservesLoading ||
    isDefillamaTvlLoading ||
    isXykPoolsLoading ||
    isXykVolumesLoading ||
    isOmnipoolVolumes7dLoading ||
    isStablepoolVolumes7dLoading ||
    isXykVolumes7dLoading ||
    isFeesLoading ||
    isPriceLoading ||
    isHdxPriceDataLoading ||
    isGigaAprLoading ||
    isGigaLockedHDXLoading ||
    isStakingSupplyLoading

  const stats = useMemo(() => {
    // 1. Calculate TVL
    let omnipoolTvl = 0
    if (omnipoolData) {
      omnipoolTvl = calculateTotalTVL(omnipoolData)
    }

    let xykTvl = 0
    if (xykData) {
      xykTvl = xykData.reduce(
        (acc, pool) => acc + parseFloat(pool.tvlInRefAssetNorm || "0"),
        0,
      )
    }

    const reservesBorrowTvl =
      borrowReserves?.formattedReserves.reduce(
        (acc, r) => acc + parseFloat(r.totalLiquidityUSD),
        0,
      ) ?? 0
    const borrowTvl =
      getNumber(platformTotal?.mmSupplyTvlNorm) || reservesBorrowTvl

    const platformTvl =
      getNumber(platformTotal?.omnipoolTvlNorm) +
      getNumber(platformTotal?.stablepoolsTvlNorm)

    // Trading / AMM TVL
    const tradingTvl =
      platformTvl + getNumber(platformTotal?.xykpoolsTvlNorm) ||
      omnipoolTvl + xykTvl
    const defillamaTvl = defillamaTvlHistory?.at(-1)?.value ?? 0
    const totalTvl =
      defillamaTvl ||
      getNumber(platformTotal?.totalTvlDecoratedNorm) ||
      tradingTvl + borrowTvl

    // 2. 24h Volume
    const platformTotalVolume = getNumber(platformTotal?.totalVolNorm)
    const platformVolume =
      getNumber(platformTotal?.omnipoolVolNorm) +
      getNumber(platformTotal?.stableswapVolNorm)
    const xykVolume =
      getNumber(platformTotal?.xykpoolVolNorm) ||
      (xykVolumes?.reduce(
        (acc, volume) => acc + getNumber(volume.poolVolume),
        0,
      ) ??
        0)
    const totalVolume = platformTotalVolume || platformVolume + xykVolume

    const omnipoolVolume7d =
      omnipoolVolumes7d?.reduce(
        (acc, volume) => acc + getNumber(volume.assetVolNorm),
        0,
      ) ?? 0
    const stablepoolVolume7d =
      stablepoolVolumes7d?.reduce(
        (acc, volume) => acc + getNumber(volume.poolVolNorm),
        0,
      ) ?? 0
    const xykVolume7d =
      xykVolumes7d?.reduce(
        (acc, volume) => acc + getNumber(volume.poolVolume),
        0,
      ) ?? 0
    const tradingVolume7d = omnipoolVolume7d + stablepoolVolume7d + xykVolume7d

    // 3. Capital Efficiency
    const capitalEfficiency = totalTvl > 0 ? (totalVolume / totalTvl) * 100 : 0

    // 4. Protocol Revenue (daily average from the last 7 days)
    const weeklyProtocolRevenue = feesChartsData
      ? Object.values(feesChartsData).reduce(
          (acc, field) => acc + field.periodAggregate,
          0,
        )
      : 0
    const protocolRevenue = weeklyProtocolRevenue / 7

    // 5. HDX Price & 24h change
    const hdxPriceValue = hdxSpotPrice ? parseFloat(hdxSpotPrice) : 0
    const hdxPricePoints =
      hdxPriceData?.assetPairPricesAndVolumesByPeriod.nodes
        .flatMap((node) => node?.buckets ?? [])
        .filter((bucket) => isValidBigSource(bucket.priceAvrgNorm))
        .map((bucket) => ({
          timestamp: Number(bucket.timestamp) || 0,
          price: isAssetInFirst
            ? Big(1).div(bucket.priceAvrgNorm).toNumber()
            : getNumber(bucket.priceAvrgNorm),
        }))
        .filter((point) => Number.isFinite(point.price) && point.price > 0)
        .sort((a, b) => a.timestamp - b.timestamp) ?? []
    const previousHdxPrice = hdxPricePoints.at(0)?.price ?? 0
    const hdxChange =
      previousHdxPrice > 0 && hdxPriceValue > 0
        ? Big(hdxPriceValue)
            .minus(previousHdxPrice)
            .div(previousHdxPrice)
            .times(100)
            .round(2)
            .toNumber()
        : 0

    // 6. Hollar Supply & Peg
    let hollarSupply = 0
    let hollarPeg = 1.0
    if (borrowReserves?.formattedReserves) {
      const ghoReserve = getGhoReserve(borrowReserves.formattedReserves)
      if (ghoReserve) {
        hollarSupply = parseFloat(ghoReserve.totalDebtUSD)
        hollarPeg = parseFloat(ghoReserve.priceInUSD)
      }
    }

    // Money Market metrics
    let totalBorrows = 0
    let borrowUtilization = 0
    if (borrowTvl > 0) {
      totalBorrows =
        borrowReserves?.formattedReserves.reduce(
          (acc, r) => acc + parseFloat(r.totalDebtUSD),
          0,
        ) || 0
      borrowUtilization = (totalBorrows / borrowTvl) * 100
    }

    // 7. GIGAHDX staking
    const gigaHdxStaked = Number(
      scaleHuman(gigaLockedHDX ?? 0n, native.decimals),
    )
    const gigaHdxStakedPercent =
      Number(circulatingSupply) > 0
        ? Big(gigaHdxStaked).div(circulatingSupply).mul(100).toNumber()
        : 0
    const gigaProjectedAprStr = `${gigaProjectedApr.toFixed(2)}%`

    return {
      totalTvl,
      borrowTvl,
      totalBorrows,
      borrowUtilization,
      tradingTvl,
      totalVolume,
      tradingVolume7d,
      capitalEfficiency,
      protocolRevenue,
      hdxPrice: hdxPriceValue,
      hdxChange,
      hollarSupply,
      hollarPeg,
      gigaProjectedAprStr,
      gigaHdxStaked,
      gigaHdxStakedPercent,
    }
  }, [
    omnipoolData,
    xykData,
    platformTotal,
    defillamaTvlHistory,
    borrowReserves,
    xykVolumes,
    omnipoolVolumes7d,
    stablepoolVolumes7d,
    xykVolumes7d,
    feesChartsData,
    hdxSpotPrice,
    hdxPriceData,
    isAssetInFirst,
    gigaProjectedApr,
    gigaLockedHDX,
    native.decimals,
    circulatingSupply,
  ])

  return {
    stats,
    isLoading,
  }
}
