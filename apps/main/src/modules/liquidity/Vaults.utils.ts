import { uniswapV3VolumeQuery } from "@galacticcouncil/indexer/neckwork"
import { uniswapv3 } from "@galacticcouncil/sdk-next/pool"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useMemo } from "react"

import {
  useVaultShares,
  useVaultSnapshots,
  VaultSnapshot,
  VaultState,
} from "@/api/gamma/vaults"
import { neckworkClient } from "@/api/neckwork"
import { useV3Pools, V3PoolBase } from "@/api/pools"
import { TAsset, useAssets } from "@/providers/assetsProvider"
import { useAssetsPrice } from "@/states/displayAsset"
import { scaleHuman } from "@/utils/formatting"

export type VaultTable = {
  id: string
  pool: V3PoolBase
  /** Pool order (token0, token1), what every amount and tick is quoted in. */
  tokens: [TAsset, TAsset]
  /** Display order, (assetA, assetB) as the SDK's V3_POOLS lists the pair. */
  pair: [TAsset, TAsset]
  feeTier: number
  /** Deposited value of the pool, at what its contract actually holds. */
  tvlDisplay: string | undefined
  volumeDisplay: string | undefined
  /**
   * Annualised pool fee APR in percent units: the LPs' share of the last 24
   * hours of fees, over what the pool holds.
   */
  apr: string | undefined
  isVolumeLoading: boolean
  isVaultLoading: boolean
  /** TVL and APR are understated until both token prices are known. */
  isPriceLoading: boolean
  price: string | undefined
  vault: VaultState | null
  status: VaultStatus
  vaultTvlDisplay: string | undefined
  canDeposit: boolean
  positionShares: bigint
  positionValueDisplay: string | undefined
}

export type VaultStatus =
  | "noVault"
  | "notStarted"
  | "depositsClosed"
  | "empty"
  | "inRange"
  | "outOfRange"

type VaultRowInput = {
  pool: V3PoolBase
  snapshot: VaultSnapshot | null
  isSnapshotLoading: boolean
  positionShares: bigint
  volumes: { address: string; volumeUsd: string; feeUsd: string }[] | undefined
  isVolumeLoading: boolean
  getAssetWithFallback: (id: string) => TAsset
  getAssetPrice: ReturnType<typeof useAssetsPrice>["getAssetPrice"]
}

/** One table row from one pool's snapshot. Pure: no reads, no hooks. */
export const toVaultRow = ({
  pool: sdkPool,
  snapshot,
  isSnapshotLoading,
  positionShares,
  volumes,
  isVolumeLoading,
  getAssetWithFallback,
  getAssetPrice,
}: VaultRowInput): VaultTable => {
  const vault = snapshot?.vault ?? null
  const live = snapshot?.pool

  // Price, tick and active liquidity from the same read as the vault band, so
  // status never compares numbers from two moments. The SDK pool stands in
  // until the snapshot lands; its tick list still feeds the chart.
  const pool: V3PoolBase = live
    ? {
        ...sdkPool,
        sqrtPriceX96: live.sqrtPriceX96,
        tick: live.tick,
        liquidity: live.liquidity,
      }
    : sdkPool

  const token0 = getAssetWithFallback(pool.token0.toString())
  const token1 = getAssetWithFallback(pool.token1.toString())

  const valueOf = (amount0: bigint, amount1: bigint) =>
    [
      { id: pool.token0, amount: amount0 },
      { id: pool.token1, amount: amount1 },
    ]
      .reduce((total, { id, amount }) => {
        const price = getAssetPrice(id.toString())
        if (!price?.isValid) return total

        const meta = getAssetWithFallback(id.toString())

        return total.plus(
          Big(scaleHuman(amount, meta.decimals)).times(price.price),
        )
      }, Big(0))
      .toString()

  // Deposited value, from what the pool contract actually holds.
  const tvlDisplay = live ? valueOf(live.reserve0, live.reserve1) : undefined

  // 24h volume and the fees it paid, from neckwork, keyed by pool contract.
  // The APR annualises the LPs' share of those fees over what the pool
  // holds, the way every other concentrated-liquidity UI states a pool APR.
  // A pool that saw no swaps is absent from the feed rather than zeroed, so
  // it only reads as unknown while the feed itself is missing.
  const volume = volumes?.find(
    (entry) => entry.address === pool.address.toLowerCase(),
  )
  const volumeDisplay = volumes ? (volume?.volumeUsd ?? "0") : undefined
  const feesDisplay = volumes ? (volume?.feeUsd ?? "0") : undefined
  const apr =
    feesDisplay !== undefined && live && tvlDisplay && Big(tvlDisplay).gt(0)
      ? Big(feesDisplay)
          .times(live.lpFeeShare)
          .times(365)
          .div(tvlDisplay)
          .times(100)
          .toString()
      : undefined

  const flipped = isPairFlipped(pool)
  const raw = Big(pool.sqrtPriceX96.toString()).pow(2).div(Big(2).pow(192))
  const price0 = raw.times(Big(10).pow(token0.decimals - token1.decimals))
  const price = (
    flipped && price0.gt(0) ? Big(1).div(price0) : price0
  ).toString()

  const vaultTvlDisplay = vault
    ? valueOf(vault.total0, vault.total1)
    : undefined

  const status = getVaultStatus(pool, vault)

  const positionValueDisplay =
    vault && vaultTvlDisplay && vault.totalSupply > 0n
      ? Big(vaultTvlDisplay)
          .times(positionShares.toString())
          .div(vault.totalSupply.toString())
          .toString()
      : undefined

  return {
    id: pool.address,
    pool,
    tokens: [token0, token1],
    pair: flipped ? [token1, token0] : [token0, token1],
    feeTier: pool.fee,
    tvlDisplay,
    volumeDisplay,
    apr,
    isVolumeLoading,
    isVaultLoading: isSnapshotLoading,
    isPriceLoading:
      getAssetPrice(pool.token0.toString()).isLoading ||
      getAssetPrice(pool.token1.toString()).isLoading,
    price,
    vault,
    status,
    vaultTvlDisplay,
    canDeposit: status === "empty" || status === "inRange",
    positionShares,
    positionValueDisplay,
  }
}

const useVaultRows = (pools: V3PoolBase[]) => {
  const { getAssetWithFallback } = useAssets()
  const snapshots = useVaultSnapshots(pools)
  const shares = useVaultShares(pools)

  const { data: volumes, isLoading: isVolumeLoading } = useQuery(
    uniswapV3VolumeQuery(neckworkClient),
  )

  const assetIds = useMemo(
    () =>
      Array.from(
        new Set(
          pools.flatMap((pool) => [
            pool.token0.toString(),
            pool.token1.toString(),
          ]),
        ),
      ),
    [pools],
  )

  const { getAssetPrice } = useAssetsPrice(assetIds)

  const data = useMemo(
    () =>
      pools.map((pool, index) =>
        toVaultRow({
          pool,
          snapshot: snapshots.data[index] ?? null,
          isSnapshotLoading: snapshots.loading[index] ?? false,
          positionShares: shares.data[index] ?? 0n,
          volumes,
          isVolumeLoading,
          getAssetWithFallback,
          getAssetPrice,
        }),
      ),
    [
      pools,
      snapshots.data,
      snapshots.loading,
      shares.data,
      volumes,
      isVolumeLoading,
      getAssetWithFallback,
      getAssetPrice,
    ],
  )

  return {
    data,
    isLoading: snapshots.isLoading,
    isPositionError: shares.isError,
    isDisconnected: shares.isDisconnected,
  }
}

const NO_POOLS: V3PoolBase[] = []

/** Every v3 pool, with its vault. */
export const useVaults = () => {
  const { data: pools, isLoading } = useV3Pools()
  const rows = useVaultRows(pools ?? NO_POOLS)

  return {
    ...rows,
    /** Rows can render: per-row vault state loads behind them. */
    isPoolsLoading: isLoading,
    isLoading: isLoading || rows.isLoading,
  }
}

/** One pool's row, reading only that pool's vault. */
export const useVault = (poolAddress: string) => {
  const { data: pools, isLoading } = useV3Pools()

  const matched = useMemo(
    () =>
      pools?.filter(
        (pool) => pool.address.toLowerCase() === poolAddress.toLowerCase(),
      ) ?? NO_POOLS,
    [pools, poolAddress],
  )

  const { data, ...rows } = useVaultRows(matched)

  return {
    ...rows,
    data: data[0],
    isLoading: isLoading || rows.isLoading,
  }
}

/** V3_POOLS lists the pair as (token1, token0), e.g. 222 sorting first. */
const isPairFlipped = (pool: V3PoolBase) =>
  uniswapv3.V3_POOLS.some(
    ({ assetA, assetB, fee }) =>
      fee === pool.fee && assetA === pool.token1 && assetB === pool.token0,
  )

const getVaultStatus = (
  pool: V3PoolBase,
  vault: VaultState | null,
): VaultStatus => {
  if (!vault) return "noVault"

  const hasPosition = vault.baseLower !== 0 || vault.baseUpper !== 0
  if (!hasPosition) return "notStarted"

  if (vault.whitelisted.toLowerCase() !== vault.uniProxy.toLowerCase())
    return "depositsClosed"

  if (pool.tick < vault.baseLower || pool.tick >= vault.baseUpper)
    return "outOfRange"

  if (vault.totalSupply === 0n) return "empty"

  return "inRange"
}

export const feeTierPercent = (fee: number) => fee / 10_000
