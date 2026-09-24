import type { Address } from "viem"

import {
  healthFactorFindings,
  zeroLtvLockFindings,
} from "@/core/assess/finding-rules"
import { projectAccount } from "@/core/assess/project-account"
import { findByAsset, isAsset } from "@/core/assets"
import { Decimal, normalize, toBaseUnits, truncate } from "@/core/big"
import { HF_MAX_TARGET, LTV_PRECISION } from "@/core/constants"
import type {
  AccountSummary,
  SummarizeAccountRequest,
} from "@/core/derive/account"
import { summarizeAccount } from "@/core/derive/account"
import type { Finding, ReserveSummary } from "@/types"

/**
 * One basis point, the step the pool truncates an account's averaged
 * liquidation threshold to.
 */
const LIQUIDATION_THRESHOLD_STEP = normalize(1, LTV_PRECISION)

export type AssessWithdrawRequest = SummarizeAccountRequest & {
  /** The reserve's underlying asset. */
  asset: Address
  /** Human units; empty or unparsable reads as zero. */
  amount: string
  /**
   * Human units of the position the app will let the user withdraw, when it
   * holds some of it back. Bounds the max when present.
   */
  spendable?: string
}

export type WithdrawAssessment = {
  /** Human units, truncated to the asset's decimals. Independent of `amount`. */
  max: string
  /**
   * Whether `max` is the whole position, so withdrawing it may send the pool's
   * "all of it" sentinel rather than an amount interest would outgrow.
   */
  maxClearsPosition: boolean
  /** The account after withdrawing `amount`. */
  projection: AccountSummary
  findings: Finding[]
}

/**
 * What withdrawing `amount` of `asset` would do. Blockers mirror
 * `ValidationLogic.validateWithdraw` and, for collateral backing debt,
 * `validateHFAndLtv` (ADR-0011).
 */
export function assessWithdraw({
  asset,
  amount,
  spendable,
  ...request
}: AssessWithdrawRequest): WithdrawAssessment {
  const reserve = findByAsset(request.reserves.reserves, asset)
  const summary = findByAsset(request.summaries, asset)
  const current = summarizeAccount(request)

  const balance =
    current.positions.find((position) =>
      isAsset(position.underlyingAsset, asset),
    )?.underlyingBalance ?? "0"
  const isCollateral = current.positions.some(
    (position) =>
      isAsset(position.underlyingAsset, asset) &&
      position.usageAsCollateralEnabledOnUser,
  )
  const hasDebt = Decimal(
    current.account.totalBorrowsMarketReferenceCurrency,
  ).gt(0)
  const amountRaw = toBaseUnits(amount, reserve.decimals)

  const findings: Finding[] = []
  if (!summary.isActive) {
    findings.push({ kind: "blocker", code: "reserveInactive", params: {} })
  }
  if (summary.isPaused) {
    findings.push({ kind: "blocker", code: "reservePaused", params: {} })
  }
  if (amountRaw > BigInt(reserve.availableLiquidity)) {
    findings.push({
      kind: "blocker",
      code: "insufficientLiquidity",
      params: {},
    })
  }
  // The pool validates HF and LTV only for collateral backing debt, and
  // lets zero-LTV collateral itself leave.
  if (isCollateral && hasDebt && !Decimal(summary.ltv).eq(0)) {
    findings.push(
      ...zeroLtvLockFindings({
        asset,
        positions: current.positions,
        reserves: request.summaries,
      }),
    )
  }

  const projection =
    amountRaw === 0n
      ? current
      : projectAccount({
          ...request,
          change: { kind: "withdraw", asset, amountRaw },
        })

  if (isCollateral) {
    findings.push(
      ...healthFactorFindings({
        current: current.account.healthFactor,
        projected: projection.account.healthFactor,
        hasDebt: Decimal(
          projection.account.totalBorrowsMarketReferenceCurrency,
        ).gt(0),
      }),
    )
  }

  const bounds = [
    Decimal(balance),
    Decimal(normalize(reserve.availableLiquidity, reserve.decimals)),
  ]
  if (spendable !== undefined) bounds.push(Decimal(spendable || "0"))
  if (isCollateral && hasDebt) {
    const headroom = healthFactorHeadroom({
      current,
      summary,
      eModeCategoryId: request.positions.eModeCategoryId,
    })
    if (headroom) bounds.push(headroom)
  }

  const max =
    !summary.isActive || summary.isPaused
      ? "0"
      : truncate(
          bounds.reduce((min, bound) => (bound.lt(min) ? bound : min)),
          reserve.decimals,
        )

  return {
    max,
    maxClearsPosition: Decimal(balance).gt(0) && Decimal(max).eq(balance),
    projection,
    findings,
  }
}

/**
 * How much of the asset can leave before the health factor reaches
 * `HF_MAX_TARGET`, in human units; `null` when the asset backs nothing.
 *
 * The health factor is collateral × averaged liquidation threshold / debt,
 * and the pool truncates that average to a whole basis point — after the
 * withdrawal as well as before. Solving against the average one step lower
 * than exact keeps the projected health factor at or above the target
 * whichever way that truncation falls.
 */
function healthFactorHeadroom({
  current,
  summary,
  eModeCategoryId,
}: {
  current: AccountSummary
  summary: ReserveSummary
  eModeCategoryId: number
}) {
  const { account } = current
  const liquidationThreshold = Decimal(
    eModeCategoryId !== 0 && eModeCategoryId === summary.eModeCategoryId
      ? summary.eModeLiquidationThreshold
      : summary.liquidationThreshold,
  ).minus(LIQUIDATION_THRESHOLD_STEP)
  const price = Decimal(summary.priceInMarketReferenceCurrency)
  if (liquidationThreshold.lte(0) || price.eq(0)) return null

  const collateral = Decimal(account.totalCollateralMarketReferenceCurrency)
  const headroom = collateral
    .times(
      Decimal(account.currentLiquidationThreshold).minus(
        LIQUIDATION_THRESHOLD_STEP,
      ),
    )
    .minus(
      Decimal(account.totalBorrowsMarketReferenceCurrency).times(HF_MAX_TARGET),
    )
    .div(liquidationThreshold)
    .div(price)

  return headroom.gt(0) ? headroom : Decimal(0)
}
