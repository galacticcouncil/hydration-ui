import type {
  NetApyPosition,
  NetApySummary,
} from "@galacticcouncil/money-market-v2/core"
import type {
  PositionSummary,
  ReserveSummary,
} from "@galacticcouncil/money-market-v2/types"
import { getAssetIdFromAddress } from "@galacticcouncil/utils"
import Big from "big.js"
import { Address } from "viem"

/**
 * One term of an effective APY, as a fraction string (ADR-0006). `assetId`
 * names whose logo and label the breakdown row shows.
 */
export type ApyPart = {
  kind: "base" | "stake" | "nativeYield" | "lpFee" | "incentive" | "vault"
  assetId?: string
  rate: string
}

/** A known rate's `total` is the sum of its `parts`. */
export type ApyRate =
  | { status: "known"; total: string; parts: ApyPart[] }
  | { status: "unavailable" }
  | { status: "loading" }

/**
 * The effective APY of a reserve. Supply and borrow are independent states;
 * `borrow` is omitted when the reserve is not borrowable.
 */
export type ReserveApy = { supply: ApyRate; borrow?: ApyRate }

/**
 * Adjusted reserves only, keyed by lowercased `underlyingAsset`. A reserve
 * absent from the map is not adjusted.
 */
export type AdjustedApys = Map<Address, ReserveApy>

/**
 * What an adjusted reserve's yield is made of. A plain asset is its own single
 * constituent with proportion 1 and its own base supply APY; a pool share has
 * one constituent per pool asset.
 */
export type ApyConstituent = {
  assetId: string
  /** Share of the reserve, as a fraction. Missing means it could not be read. */
  proportion?: string
  /** Base supply APY of the constituent, absent when it has no reserve. */
  supplyApy?: string
  /** `apy` is null when the feed's reading is unavailable. */
  feed?: { kind: "stake" | "nativeYield"; apy: string | null }
}

export type AdjustedApyInput = {
  /** The reserve's own summary in the selected market. */
  reserve: Pick<
    ReserveSummary,
    "supplyApy" | "variableBorrowApy" | "borrowingEnabled" | "supplyIncentives"
  >
  constituents: ReadonlyArray<ApyConstituent>
  /** null: the read failed; undefined: not a pool share. */
  lpFeeApy: string | null | undefined
  /** null: the read failed; undefined: not the vault's reserve. */
  vaultApr: string | null | undefined
}

const UNAVAILABLE: ApyRate = { status: "unavailable" }

const known = (parts: ApyPart[]): ApyRate => ({
  status: "known",
  total: parts.reduce((acc, part) => acc.plus(part.rate), Big(0)).toFixed(),
  parts,
})

const weighted = (proportion: string, rate: string) =>
  Big(proportion).times(rate).toFixed()

const incentiveParts = (
  incentives: ReserveSummary["supplyIncentives"],
): ApyPart[] =>
  incentives.map(({ rewardApr, rewardTokenAddress }) => ({
    kind: "incentive",
    assetId: getAssetIdFromAddress(rewardTokenAddress),
    rate: Big(rewardApr).toFixed(),
  }))

const supplyRate = ({
  reserve,
  constituents,
  lpFeeApy,
  vaultApr,
}: AdjustedApyInput): ApyRate => {
  if (vaultApr === null || lpFeeApy === null) return UNAVAILABLE

  if (vaultApr !== undefined) {
    return known([{ kind: "vault", rate: Big(vaultApr).toFixed() }])
  }

  const parts: ApyPart[] = []

  for (const { assetId, proportion, supplyApy, feed } of constituents) {
    if (proportion === undefined || feed?.apy === null) return UNAVAILABLE

    if (supplyApy !== undefined) {
      parts.push({
        kind: "base",
        assetId,
        rate: weighted(proportion, supplyApy),
      })
    }

    if (feed) {
      parts.push({
        kind: feed.kind,
        assetId,
        rate: weighted(proportion, feed.apy),
      })
    }
  }

  if (lpFeeApy !== undefined) {
    parts.push({ kind: "lpFee", rate: Big(lpFeeApy).toFixed() })
  }

  parts.push(...incentiveParts(reserve.supplyIncentives))

  return known(parts)
}

const borrowRate = ({ reserve, constituents }: AdjustedApyInput): ApyRate => {
  const parts: ApyPart[] = [
    { kind: "base", rate: Big(reserve.variableBorrowApy).toFixed() },
  ]

  for (const { assetId, proportion, feed } of constituents) {
    if (!feed) continue
    if (proportion === undefined || feed.apy === null) return UNAVAILABLE

    parts.push({
      kind: feed.kind,
      assetId,
      rate: weighted(proportion, feed.apy),
    })
  }

  return known(parts)
}

/**
 * The effective APY of an adjusted reserve, composed from inputs that are
 * already read: nothing here fetches or reads the clock.
 *
 * Supply is the sum over constituents of proportion x (base supply APY + feed
 * APY), plus the LP fee and the reserve's supply incentive APRs; for the
 * vault's reserve it is the vault APR alone. Borrow, only for a borrowable
 * reserve, is the reserve's own base borrow APY plus the feed APY and nothing
 * else: borrow incentives are counted separately, and supply incentives and
 * the LP fee are not a borrower's (a deliberate departure from legacy
 * `calculateAssetApyTotals`).
 *
 * A null input or a missing proportion makes the side it feeds unavailable,
 * never a guess: there is no equal split and no fallback to the base APY.
 */
export const adjustedApy = (input: AdjustedApyInput): ReserveApy => ({
  supply: supplyRate(input),
  ...(input.reserve.borrowingEnabled && { borrow: borrowRate(input) }),
})

/**
 * The effective APY of any reserve, the one shape every surface and the net
 * APY read a rate through. An adjusted reserve's entry is returned as is. An
 * unadjusted reserve is always known: supply is its base APY plus its supply
 * incentive APRs, and borrow, only when borrowable, is its base borrow APY
 * alone (borrow incentives are counted separately).
 */
export const reserveApy = (
  summary: Pick<
    ReserveSummary,
    "supplyApy" | "variableBorrowApy" | "borrowingEnabled" | "supplyIncentives"
  >,
  adjusted?: ReserveApy,
): ReserveApy => {
  if (adjusted) return adjusted

  return {
    supply: known([
      { kind: "base", rate: Big(summary.supplyApy).toFixed() },
      ...incentiveParts(summary.supplyIncentives),
    ]),
    ...(summary.borrowingEnabled && {
      borrow: known([
        { kind: "base", rate: Big(summary.variableBorrowApy).toFixed() },
      ]),
    }),
  }
}

/** A held position with its reserve and that reserve's effective APY. */
export type NetApyRow = {
  position: Pick<PositionSummary, "underlyingBalanceUsd" | "variableBorrowsUsd">
  reserve: Pick<ReserveSummary, "borrowIncentives">
  apy: ReserveApy
}

const totalOrNull = (rate: ApyRate | undefined) =>
  rate?.status === "known" ? rate.total : null

/**
 * Maps held positions into what `summarizeNetApy` takes, so the net APY runs
 * on the same totals the surfaces display. A rate that is unavailable, or a
 * borrow side the reserve does not have, is `null`. Borrow incentives count
 * for every reserve, adjusted ones included, since no effective borrow APY
 * carries them.
 *
 * A loading rate also maps to `null`: check `isNetApyLoading` first.
 */
export const toNetApyPositions = (
  rows: ReadonlyArray<NetApyRow>,
): NetApyPosition[] =>
  rows.map(({ position, reserve, apy }) => ({
    suppliedUsd: position.underlyingBalanceUsd,
    borrowedUsd: position.variableBorrowsUsd,
    supplyRate: totalOrNull(apy.supply),
    borrowRate: totalOrNull(apy.borrow),
    borrowRewardRate: reserve.borrowIncentives
      .reduce((acc, { rewardApr }) => acc.plus(rewardApr), Big(0))
      .toFixed(),
  }))

/**
 * Whether the net APY must wait: a rate still loading on a side that is held.
 * A loading rate on an unheld side holds nothing up.
 */
export const isNetApyLoading = (rows: ReadonlyArray<NetApyRow>): boolean =>
  rows.some(
    ({ position, apy }) =>
      (Big(position.underlyingBalanceUsd).gt(0) &&
        apy.supply.status === "loading") ||
      (Big(position.variableBorrowsUsd).gt(0) &&
        apy.borrow?.status === "loading"),
  )

/**
 * An account's net, earned and debt APY as a surface reads them: loading while
 * a held side's rate is, otherwise the summary over the effective APYs.
 */
export type NetApyState =
  | { status: "loading" }
  | ({ status: "ready" } & NetApySummary)
