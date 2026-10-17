import Big from "big.js"
import type { Address } from "viem"

import { Decimal } from "@/core/big"
import {
  HF_ACKNOWLEDGEMENT_THRESHOLD,
  HF_BLOCKER_THRESHOLD,
} from "@/core/constants"
import type { Finding, PositionSummary, ReserveSummary } from "@/types"

/**
 * The rules more than one action reports, written once so two actions can
 * never disagree on them (ADR-0011). Each returns a list of zero or one
 * findings, so an assessment composes them by spreading.
 */

/** The no-debt sentinel `summarizeAccount` reports for an unbounded HF. */
const NO_DEBT_HEALTH_FACTOR = "-1"

/** Cap usage, in percent, from which a cap is reported as nearly reached. */
const CAP_NEARLY_REACHED_PERCENT = 98

/** Cap usage, in percent, from which a cap is treated as reached. */
const CAP_REACHED_PERCENT = 99.99

export type HealthFactorFindingsRequest = {
  /** The account's health factor now. */
  current: string
  /** The account's health factor once the action has gone through. */
  projected: string
  /** Whether the projected account still owes anything. */
  hasDebt: boolean
}

const roundHealthFactor = (healthFactor: string): string =>
  Decimal(healthFactor).round(2, Big.roundDown).toFixed(2)

/**
 * The pool's own health-factor check, then the risk the user must accept.
 * A drop that is invisible at two decimals is not worth acknowledging.
 */
export function healthFactorFindings({
  current,
  projected,
  hasDebt,
}: HealthFactorFindingsRequest): Finding[] {
  if (projected === NO_DEBT_HEALTH_FACTOR) return []

  if (hasDebt && Decimal(projected).lt(HF_BLOCKER_THRESHOLD)) {
    return [{ kind: "blocker", code: "healthFactorBelowOne", params: {} }]
  }

  if (
    Decimal(projected).lt(HF_ACKNOWLEDGEMENT_THRESHOLD) &&
    roundHealthFactor(projected) !== roundHealthFactor(current)
  ) {
    return [{ kind: "acknowledgement", code: "healthFactorRisk", params: {} }]
  }

  return []
}

/**
 * A cap-usage warning once `used` reaches 98% of `cap`. A cap of zero means
 * the reserve has none. Usage from 99.99% on is reported as 100: the notice
 * says the cap is reached, not that a sliver is left.
 */
function capFindings(
  code:
    | "supplyCapNearlyReached"
    | "borrowCapNearlyReached"
    | "debtCeilingNearlyReached",
  used: string,
  cap: string,
): Finding[] {
  if (Decimal(cap).eq(0)) return []

  const usage = Decimal(used).div(cap).times(100)
  if (usage.lt(CAP_NEARLY_REACHED_PERCENT)) return []

  const percent = usage.gte(CAP_REACHED_PERCENT)
    ? 100
    : Number(usage.round(2, Big.roundDown).toFixed(2))

  return [{ kind: "notice", tone: "warning", code, params: { percent } }]
}

export const supplyCapFindings = (
  reserve: Pick<ReserveSummary, "totalLiquidity" | "supplyCap">,
): Finding[] =>
  capFindings(
    "supplyCapNearlyReached",
    reserve.totalLiquidity,
    reserve.supplyCap,
  )

/**
 * Takes the used amount and cap separately because Hollar's real cap is its
 * facilitator's capacity, not the reserve's unset `borrowCap`.
 */
export const borrowCapFindings = (
  totalDebt: string,
  borrowCap: string,
): Finding[] => capFindings("borrowCapNearlyReached", totalDebt, borrowCap)

export const debtCeilingFindings = (
  reserve: Pick<ReserveSummary, "isolationModeTotalDebtUsd" | "debtCeilingUsd">,
): Finding[] =>
  capFindings(
    "debtCeilingNearlyReached",
    reserve.isolationModeTotalDebtUsd,
    reserve.debtCeilingUsd,
  )

export type ZeroLtvLockFindingsRequest = {
  /** The asset the action is on, which never blocks itself. */
  asset: Address
  positions: Pick<
    PositionSummary,
    | "underlyingAsset"
    | "symbol"
    | "usageAsCollateralEnabledOnUser"
    | "underlyingBalance"
  >[]
  reserves: Pick<
    ReserveSummary,
    "underlyingAsset" | "ltv" | "liquidationThreshold"
  >[]
}

/**
 * The pool refuses to lower an account's LTV while it holds collateral whose
 * LTV is zero but still counts towards liquidation — `ValidationLogic`'s
 * `LTV_VALIDATION_FAILED`. Those positions must be withdrawn or disabled first.
 */
export function zeroLtvLockFindings({
  asset,
  positions,
  reserves,
}: ZeroLtvLockFindingsRequest): Finding[] {
  const symbols = positions
    .filter((position) => {
      if (position.underlyingAsset.toLowerCase() === asset.toLowerCase()) {
        return false
      }
      if (!position.usageAsCollateralEnabledOnUser) return false
      if (Decimal(position.underlyingBalance).lte(0)) return false

      const reserve = reserves.find(
        (candidate) =>
          candidate.underlyingAsset.toLowerCase() ===
          position.underlyingAsset.toLowerCase(),
      )
      return (
        reserve !== undefined &&
        Decimal(reserve.ltv).eq(0) &&
        !Decimal(reserve.liquidationThreshold).eq(0)
      )
    })
    .map((position) => position.symbol)

  if (symbols.length === 0) return []

  return [
    { kind: "blocker", code: "zeroLtvCollateralBlocks", params: { symbols } },
  ]
}
