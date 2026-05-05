import { clients } from "@galacticcouncil/xc-cfg"
import type { AssetDepositLimit } from "@galacticcouncil/xc-cfg/build/clients/chain/hydration/circuit-breaker"
import { clamp } from "remeda"

const { ASSET_LOCKDOWN_PERIOD_BLOCKS } = clients

export const getDepositLimitUsedAmount = (data: AssetDepositLimit): bigint => {
  if (data.periodExpired || data.baselineIssuance === undefined) return 0n
  const net = data.currentIssuance - data.baselineIssuance
  return net > 0n ? net : 0n
}

export const getDepositLimitUsagePercent = (
  data: AssetDepositLimit,
): number | null => {
  if (data.limit === null || data.limit === 0n) return null
  const used = getDepositLimitUsedAmount(data)
  const pct = Number((used * 100n) / data.limit)
  return clamp(pct, { min: 0, max: 100 })
}

export type DepositLimitTimeWindowType =
  | "lockdown"
  | "rolling"
  | "expired"
  | "none"

export const getDepositLimitTimeWindowType = (
  data: AssetDepositLimit,
): DepositLimitTimeWindowType => {
  if (data.locked && data.lockedUntilBlock !== undefined) return "lockdown"
  if (data.periodExpired) return "expired"
  if (data.lastResetBlock !== undefined) return "rolling"
  return "none"
}

export type DepositLimitPeriodWindow =
  | { type: "lockdown"; durationMs: number }
  | { type: "reset"; durationMs: number }
  | { type: "expired" }

export const getDepositLimitPeriodWindow = (
  data: AssetDepositLimit,
  currentBlock: number,
  slotDurationMs: number,
): DepositLimitPeriodWindow | undefined => {
  if (data.locked && data.lockedUntilBlock !== undefined) {
    return {
      type: "lockdown",
      durationMs: (data.lockedUntilBlock - currentBlock) * slotDurationMs,
    }
  }
  if (!data.periodExpired && data.lastResetBlock !== undefined) {
    const blocksLeft =
      data.lastResetBlock + ASSET_LOCKDOWN_PERIOD_BLOCKS - currentBlock
    return {
      type: "reset",
      durationMs: blocksLeft * slotDurationMs,
    }
  }
  if (data.periodExpired) {
    return { type: "expired" }
  }
  return undefined
}
