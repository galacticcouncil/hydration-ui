import type Big from "big.js"
import type { Address } from "viem"

import { findByAsset, isAsset } from "@/core/assets"
import { Decimal, toBaseUnits, truncate } from "@/core/big"
import { HF_MAX_TARGET } from "@/core/constants"
import type {
  AccountSummary,
  SummarizeAccountRequest,
} from "@/core/derive-account"
import { summarizeAccount } from "@/core/derive-account"
import { eModeCategories } from "@/core/derive-emode"
import {
  borrowCapFindings,
  debtCeilingFindings,
  healthFactorFindings,
} from "@/core/finding-rules"
import { projectAccount } from "@/core/project-account"
import type { Finding, HollarFacilitator } from "@/types"

export type AssessBorrowRequest = SummarizeAccountRequest & {
  /** The reserve's underlying asset. */
  asset: Address
  /** Human units; empty or unparsable reads as zero. */
  amount: string
  /**
   * The market's Hollar facilitator bucket — pass it exactly when `asset` is
   * the market's Hollar token. Hollar is minted rather than lent out, so the
   * bucket replaces the reserve's liquidity and its unset borrow cap.
   */
  hollarFacilitator?: HollarFacilitator
}

export type BorrowAssessment = {
  /** Human units, truncated to the asset's decimals. Independent of `amount`. */
  max: string
  /** The account after borrowing `amount`. */
  projection: AccountSummary
  findings: Finding[]
}

/**
 * What borrowing `amount` of `asset` would do, Hollar included. Blockers
 * mirror `ValidationLogic.validateBorrow` (ADR-0011) — including a frozen
 * reserve, which v1's regular borrow let through.
 */
export function assessBorrow({
  asset,
  amount,
  hollarFacilitator,
  ...request
}: AssessBorrowRequest): BorrowAssessment {
  const reserve = findByAsset(request.reserves.reserves, asset)
  const summary = findByAsset(request.summaries, asset)
  const current = summarizeAccount(request)
  const { account } = current
  const userEModeCategoryId = request.positions.eModeCategoryId

  const blockers: Finding[] = []
  if (!summary.isActive) {
    blockers.push({ kind: "blocker", code: "reserveInactive", params: {} })
  }
  if (summary.isPaused) {
    blockers.push({ kind: "blocker", code: "reservePaused", params: {} })
  }
  if (summary.isFrozen) {
    blockers.push({ kind: "blocker", code: "reserveFrozen", params: {} })
  }
  if (!summary.borrowingEnabled) {
    blockers.push({ kind: "blocker", code: "borrowingDisabled", params: {} })
  }
  if (
    Decimal(account.totalCollateralMarketReferenceCurrency).eq(0) ||
    Decimal(account.currentLoanToValue).eq(0)
  ) {
    blockers.push({ kind: "blocker", code: "noCollateral", params: {} })
  }
  if (
    userEModeCategoryId !== 0 &&
    summary.eModeCategoryId !== userEModeCategoryId
  ) {
    const category = eModeCategories(request.summaries).find(
      (candidate) => candidate.id === userEModeCategoryId,
    )
    blockers.push({
      kind: "blocker",
      code: "eModeCategoryMismatch",
      params: { category: category?.label ?? "" },
    })
  }
  if (account.isInIsolationMode && !summary.borrowableInIsolation) {
    blockers.push({
      kind: "blocker",
      code: "notBorrowableInIsolation",
      params: {},
    })
  }
  if (hasSiloedBorrowingConflict(request, current, asset)) {
    blockers.push({
      kind: "blocker",
      code: "siloedBorrowingConflict",
      params: {},
    })
  }
  const hollarCapacity = hollarFacilitator
    ? Decimal(hollarFacilitator.maxCapacity).minus(hollarFacilitator.level)
    : null
  if (hollarCapacity?.lte(0)) {
    blockers.push({
      kind: "blocker",
      code: "hollarCapacityExhausted",
      params: {},
    })
  }

  const notices: Finding[] = [
    ...(hollarFacilitator
      ? borrowCapFindings(
          hollarFacilitator.level,
          hollarFacilitator.maxCapacity,
        )
      : borrowCapFindings(summary.totalDebt, summary.borrowCap)),
  ]
  if (account.isolatedReserve) {
    notices.push(
      ...debtCeilingFindings(
        findByAsset(request.summaries, account.isolatedReserve),
      ),
    )
  }
  notices.push({
    kind: "notice",
    tone: "info",
    code: "parameterChangesMayAffectHealthFactor",
    params: {},
  })

  const amountRaw = toBaseUnits(amount, reserve.decimals)
  const projection =
    amountRaw === 0n
      ? current
      : projectAccount({
          ...request,
          change: { kind: "borrow", asset, amountRaw },
        })

  const price = Decimal(summary.priceInMarketReferenceCurrency)
  const bounds: Big[] = price.gt(0)
    ? [
        Decimal(account.availableBorrowsMarketReferenceCurrency).div(price),
        healthFactorHeadroom(current).div(price),
      ]
    : [Decimal(0)]
  // Hollar is minted on borrow, so what its aToken holds bounds nothing; the
  // pool's own liquidity figure already carries the reserve's borrow cap.
  bounds.push(hollarCapacity ?? Decimal(summary.availableLiquidity))

  const max =
    blockers.length > 0
      ? "0"
      : truncate(
          bounds.reduce((min, bound) => (bound.lt(min) ? bound : min)),
          reserve.decimals,
        )

  return {
    max,
    projection,
    findings: [
      ...blockers,
      ...healthFactorFindings({
        current: account.healthFactor,
        projected: projection.account.healthFactor,
        hasDebt: Decimal(
          projection.account.totalBorrowsMarketReferenceCurrency,
        ).gt(0),
      }),
      ...notices,
    ],
  }
}

/**
 * `validateBorrow`'s siloed-borrowing rule: an account holding siloed debt may
 * borrow nothing else, and a siloed reserve may only be an account's one debt.
 */
function hasSiloedBorrowingConflict(
  request: SummarizeAccountRequest,
  current: AccountSummary,
  asset: Address,
): boolean {
  const otherDebt = current.positions.filter(
    (position) =>
      !isAsset(position.underlyingAsset, asset) &&
      Decimal(position.variableBorrows).gt(0),
  )
  if (otherDebt.length === 0) return false
  if (findByAsset(request.summaries, asset).isSiloedBorrowing) return true

  return otherDebt.some(
    (position) =>
      findByAsset(request.summaries, position.underlyingAsset)
        .isSiloedBorrowing,
  )
}

/**
 * How much more debt, in the market reference currency, leaves the health
 * factor at `HF_MAX_TARGET`. A borrow moves no collateral, so the account's
 * averaged liquidation threshold — already truncated to whole basis points,
 * as the pool holds it — stays exactly where it is.
 */
function healthFactorHeadroom({ account }: AccountSummary): Big {
  const headroom = Decimal(account.totalCollateralMarketReferenceCurrency)
    .times(account.currentLiquidationThreshold)
    .div(HF_MAX_TARGET)
    .minus(account.totalBorrowsMarketReferenceCurrency)

  return headroom.gt(0) ? headroom : Decimal(0)
}
