import type { Address } from "viem"

import {
  debtCeilingFindings,
  healthFactorFindings,
  zeroLtvLockFindings,
} from "@/core/assess/finding-rules"
import { projectAccount } from "@/core/assess/project-account"
import { findByAsset, isAsset } from "@/core/assets"
import { Decimal } from "@/core/big"
import type {
  AccountSummary,
  SummarizeAccountRequest,
} from "@/core/derive/account"
import { summarizeAccount } from "@/core/derive/account"
import type { Finding } from "@/types"

export type AssessCollateralRequest = SummarizeAccountRequest & {
  /** The reserve's underlying asset. */
  asset: Address
}

export type CollateralAssessment = {
  /** Whether the toggle enables the asset as collateral, rather than disables it. */
  enable: boolean
  /** The account after the toggle. */
  projection: AccountSummary
  findings: Finding[]
}

/**
 * What flipping `asset`'s collateral flag would do; the direction is always
 * the opposite of the current flag. Blockers mirror
 * `ValidationLogic.validateSetUseReserveAsCollateral`, then
 * `validateUseAsCollateral` when enabling or `validateHFAndLtv` when
 * disabling (ADR-0011).
 */
export function assessCollateral({
  asset,
  ...request
}: AssessCollateralRequest): CollateralAssessment {
  const summary = findByAsset(request.summaries, asset)
  const current = summarizeAccount(request)

  const position = current.positions.find((candidate) =>
    isAsset(candidate.underlyingAsset, asset),
  )
  const enable = !position?.usageAsCollateralEnabledOnUser
  // The pool counts collateral by flag alone, whatever the balance.
  const hasOtherCollateral = request.positions.positions.some(
    (candidate) =>
      !isAsset(candidate.underlyingAsset, asset) &&
      candidate.usageAsCollateralEnabledOnUser,
  )

  const blockers: Finding[] = []
  if (Decimal(position?.underlyingBalance ?? "0").lte(0)) {
    blockers.push({ kind: "blocker", code: "noSupply", params: {} })
  }
  if (!summary.isActive) {
    blockers.push({ kind: "blocker", code: "reserveInactive", params: {} })
  }
  if (summary.isPaused) {
    blockers.push({ kind: "blocker", code: "reservePaused", params: {} })
  }

  if (enable) {
    // The pool's `validateUseAsCollateral` refuses an LTV of zero; a
    // liquidation threshold of zero never counts as collateral at all.
    if (
      Decimal(summary.liquidationThreshold).eq(0) ||
      Decimal(summary.ltv).eq(0)
    ) {
      blockers.push({ kind: "blocker", code: "cannotBeCollateral", params: {} })
    }
    if (
      hasOtherCollateral &&
      (current.account.isInIsolationMode || summary.isIsolated)
    ) {
      blockers.push({
        kind: "blocker",
        code: "isolationCollateralConflict",
        params: {},
      })
    }
  } else if (!Decimal(summary.ltv).eq(0)) {
    blockers.push(
      ...zeroLtvLockFindings({
        asset,
        positions: current.positions,
        reserves: request.summaries,
      }),
    )
  }

  const projection = projectAccount({
    ...request,
    change: { kind: "setUsageAsCollateral", asset, enabled: enable },
  })

  const notices: Finding[] = []
  if (enable && blockers.length === 0) {
    if (summary.isIsolated) {
      notices.push(
        {
          kind: "notice",
          tone: "info",
          code: "enteringIsolationMode",
          params: {},
        },
        ...debtCeilingFindings(summary),
      )
    } else {
      notices.push({
        kind: "notice",
        tone: "info",
        code: "collateralIncreasesBorrowingPower",
        params: {},
      })
    }
  }
  if (
    !enable &&
    current.account.isolatedReserve !== null &&
    isAsset(current.account.isolatedReserve, asset)
  ) {
    notices.push({
      kind: "notice",
      tone: "info",
      code: "exitingIsolationMode",
      params: {},
    })
  }

  return {
    enable,
    projection,
    findings: [
      ...blockers,
      // Enabling only ever raises the health factor.
      ...(enable
        ? []
        : healthFactorFindings({
            current: current.account.healthFactor,
            projected: projection.account.healthFactor,
            hasDebt: Decimal(
              projection.account.totalBorrowsMarketReferenceCurrency,
            ).gt(0),
          })),
      ...notices,
    ],
  }
}
