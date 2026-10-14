import { isNullish } from "remeda"

/**
 * Steady-state loop leverage implied by the HF target: each loop iteration
 * borrows LT/targetHf of the previous one, so the geometric series converges
 * at 1/(1 − LT/targetHf). Used for the advertised rate instead of the live
 * loop gearing, which dips after every large deposit and would make the
 * estimate a function of whoever deposited last.
 */
export const targetLoopLeverage = (
  targetHf: number | null | undefined,
  primeLtBps: number | null | undefined,
): number | null => {
  if (isNullish(targetHf) || isNullish(primeLtBps)) return null
  if (targetHf <= 0 || primeLtBps <= 0) return null
  const ratio = primeLtBps / 1e4 / targetHf
  if (ratio >= 1) return null
  return 1 / (1 - ratio)
}

/**
 * The position compounds continuously (funded yield re-enters the same
 * balance), so the realized annual growth of a simple rate r is e^r − 1.
 * Percent in, percent out.
 */
export const toApy = (aprPct: number | null): number | null =>
  aprPct === null ? null : (Math.expm1(aprPct / 100) || 0) * 100

/** synth·LT covers the Main debt exactly (CompoundLogic mints debt/synthLt). */
const SYNTH_PER_DEBT = 1 / 0.98

/**
 * Share of the vault's borrowing capacity actually borrowed and earning —
 * the factor between the steady-state estimate and what a holder accrues
 * right now. Pro-rata shares make the vault's fraction every holder's.
 * The Main account's totalCollateralBase includes the synthetic, stripped
 * via its known debt ratio before applying max LTV.
 */
export const borrowDeployedFraction = ({
  mainCollUsd,
  mainDebtUsd,
  maxLtv,
}: {
  mainCollUsd: number | null | undefined
  mainDebtUsd: number | null | undefined
  maxLtv: number | null | undefined
}): number | null => {
  if (
    isNullish(mainCollUsd) ||
    isNullish(mainDebtUsd) ||
    isNullish(maxLtv) ||
    maxLtv <= 0 ||
    mainDebtUsd < 0
  ) {
    return null
  }
  const realColl = mainCollUsd - mainDebtUsd * SYNTH_PER_DEBT
  if (realColl <= 0) return null
  return Math.min(mainDebtUsd / (realColl * maxLtv), 1)
}
