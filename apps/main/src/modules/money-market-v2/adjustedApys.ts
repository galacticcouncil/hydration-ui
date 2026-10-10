import Big from "big.js"
import { Address } from "viem"

import type { LpFeeReadingStatus } from "@/api/external/lpFee"
import {
  ConstituentFeed,
  PoolAsset,
  resolveConstituents,
} from "@/modules/money-market-v2/constituents"
import {
  adjustedApy,
  AdjustedApyInput,
  AdjustedApys,
  ApyRate,
  ReserveApy,
} from "@/modules/money-market-v2/effectiveApy"

export type VaultAprReading =
  | { status: "known"; apr: string }
  | { status: "loading" }
  | { status: "unavailable" }

/**
 * Reads the BIL vault's APR off a `useVaultStats` result as a fraction. The
 * query starts with placeholder `initialData` (an 18% APR nobody read from the
 * chain), so its data only counts once a fetch has finished and succeeded:
 * not yet fetched is loading, anything else is unavailable.
 */
export const vaultAprReading = ({
  data,
  isFetched,
  isSuccess,
}: {
  data: { apr: number } | undefined
  isFetched: boolean
  isSuccess: boolean
}): VaultAprReading => {
  if (!isFetched) return { status: "loading" }

  if (!isSuccess || !data || !Number.isFinite(data.apr)) {
    return { status: "unavailable" }
  }

  return { status: "known", apr: Big(data.apr).div(100).toFixed() }
}

/** Base supply APY of every `hydration_v3` reserve, by asset id. */
export type HydrationSupplyApys =
  | { status: "known"; apys: ReadonlyMap<string, string> }
  | { status: "loading" }
  | { status: "unavailable" }

/** One adjusted reserve listed in the selected market, with its own reads. */
export type AdjustedReserve = {
  assetId: string
  /** Lowercased `underlyingAsset`, the key of the resulting map. */
  address: Address
  /** The reserve's own summary in the selected market. */
  reserve: AdjustedApyInput["reserve"]
  /**
   * The pool's assets when the reserve is a stableswap share, else absent.
   * Empty when the registry does not list them.
   */
  poolAssets?: ReadonlyArray<PoolAsset>
  /** Present for a stableswap share only. */
  lpFee?: LpFeeReadingStatus
  /** Present for the vault's reserve only. */
  vault?: VaultAprReading
}

export type GatherAdjustedApysInput = {
  reserves: ReadonlyArray<AdjustedReserve>
  hydrationSupplyApys: HydrationSupplyApys
  /** Pool proportions are on their first read. */
  poolsLoading: boolean
  /** The reading of every configured feed, by the asset id it is for. */
  feeds: ReadonlyMap<string, ConstituentFeed>
}

const LOADING: ApyRate = { status: "loading" }
const UNAVAILABLE: ApyRate = { status: "unavailable" }
const NO_SUPPLY_APYS: ReadonlyMap<string, string> = new Map()

const gatherReserveApy = (
  { assetId, reserve, poolAssets, lpFee, vault }: AdjustedReserve,
  { hydrationSupplyApys, poolsLoading, feeds }: GatherAdjustedApysInput,
): ReserveApy => {
  const isPool = !!poolAssets

  const { supplyApy } = reserve

  const { constituents, loading: feedsLoading } = resolveConstituents({
    assetId,
    supplyApy,
    poolAssets,
    hydrationSupplyApys:
      hydrationSupplyApys.status === "known"
        ? hydrationSupplyApys.apys
        : NO_SUPPLY_APYS,
    feeds,
  })

  // a read still loading goes in as failed and is overridden below
  const composed = adjustedApy({
    reserve,
    constituents,
    lpFeeApy: lpFee && (lpFee.status === "known" ? lpFee.apy : null),
    vaultApr: vault && (vault.status === "known" ? vault.apr : null),
  })

  // the vault APR stands alone: nothing else is an input of that supply rate
  const supplyLoading = vault
    ? vault.status === "loading"
    : feedsLoading ||
      (isPool && (poolsLoading || hydrationSupplyApys.status === "loading")) ||
      lpFee?.status === "loading"

  // without its pool assets or their base rates a share's supply rate would
  // be short
  const supplyUnavailable =
    isPool &&
    (poolAssets.length === 0 || hydrationSupplyApys.status !== "known")

  const borrowLoading = feedsLoading || (isPool && poolsLoading)

  return {
    supply: supplyLoading
      ? LOADING
      : supplyUnavailable
        ? UNAVAILABLE
        : composed.supply,
    ...(composed.borrow && {
      borrow: borrowLoading ? LOADING : composed.borrow,
    }),
  }
}

/**
 * The effective APY of every adjusted reserve listed in the selected market,
 * from reads that are already in hand: nothing here fetches or reads the
 * clock.
 *
 * Each side is loading while any of its own inputs is on its first read, and
 * only then; a side whose inputs have all settled is composed by
 * `adjustedApy`, which reports a failed input as unavailable. The supply side
 * of a stableswap share waits on the pool proportions, the `hydration_v3` base
 * rates, the LP fee and its pool assets' feeds; a plain asset waits on its own
 * feed only; the vault's reserve waits on the vault APR alone.
 */
export const gatherAdjustedApys = (
  input: GatherAdjustedApysInput,
): AdjustedApys =>
  new Map(
    input.reserves.map((reserve) => [
      reserve.address,
      gatherReserveApy(reserve, input),
    ]),
  )
