import { clients } from "@galacticcouncil/xc-cfg"
import type { NttRateLimit } from "@galacticcouncil/xc-cfg/build/clients"
import type {
  AssetDepositLimit,
  GlobalWithdrawLimit,
} from "@galacticcouncil/xc-cfg/build/clients/chain/hydration/circuit-breaker"
import { clamp } from "remeda"

import type { XcmAlert } from "@/modules/xcm/transfer/hooks/useXcmProvider"

export type { NttRateLimit }

export enum XcmLimitAlertKey {
  CBreakerOutboundLockdown = "cBreakerOutboundLockdown",
  CBreakerOutboundExceeded = "cBreakerOutboundExceeded",
  CBreakerInboundLockdown = "cBreakerInboundLockdown",
  CBreakerInboundExceeded = "cBreakerInboundExceeded",
  WormholeOutboundExceeded = "wormholeOutboundExceeded",
  WormholeInboundExceeded = "wormholeInboundExceeded",
}

export const CBREAKER_INBOUND_LIMIT_ALERT_KEYS: XcmLimitAlertKey[] = [
  XcmLimitAlertKey.CBreakerInboundLockdown,
  XcmLimitAlertKey.CBreakerInboundExceeded,
]

export const CBREAKER_OUTBOUND_LIMIT_ALERT_KEYS: XcmLimitAlertKey[] = [
  XcmLimitAlertKey.CBreakerOutboundExceeded,
  XcmLimitAlertKey.CBreakerOutboundLockdown,
]

export const WORMHOLE_LIMIT_ALERT_KEYS: XcmLimitAlertKey[] = [
  XcmLimitAlertKey.WormholeOutboundExceeded,
  XcmLimitAlertKey.WormholeInboundExceeded,
]

// Single source of truth for which limit alert wins — most blocking first.
export const XCM_LIMIT_ALERT_PRIORITY: XcmLimitAlertKey[] = [
  XcmLimitAlertKey.CBreakerOutboundLockdown,
  XcmLimitAlertKey.WormholeOutboundExceeded,
  XcmLimitAlertKey.CBreakerOutboundExceeded,
  XcmLimitAlertKey.WormholeInboundExceeded,
  XcmLimitAlertKey.CBreakerInboundLockdown,
  XcmLimitAlertKey.CBreakerInboundExceeded,
]

const { ASSET_LOCKDOWN_PERIOD_BLOCKS } = clients

export const hasXcmLimitAlertKey = (
  key: string,
  keys: XcmLimitAlertKey[],
): key is XcmLimitAlertKey => (keys as string[]).includes(key)

export const pickXcmLimitAlert = (alerts: XcmAlert[]): XcmAlert | undefined => {
  for (const key of XCM_LIMIT_ALERT_PRIORITY) {
    const alert = alerts.find((a) => a.key === key)
    if (alert) return alert
  }
  return undefined
}

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

export type DepositLimitPeriodWindow =
  | { type: "lockdown"; durationMs: number }
  | { type: "reset"; durationMs: number }
  | { type: "expired" }

export const getDepositLimitPeriodWindow = (
  data: AssetDepositLimit,
  currentBlock: number,
  slotDurationMs: number,
): DepositLimitPeriodWindow | undefined => {
  if (data.locked && data.lockedUntilBlock) {
    return {
      type: "lockdown",
      durationMs: (data.lockedUntilBlock - currentBlock) * slotDurationMs,
    }
  }
  if (!data.periodExpired && data.lastResetBlock) {
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

export const getDepositLimitLockUntilDate = (
  data: AssetDepositLimit,
  currentBlock: number,
  currentTimestamp: number,
  slotDurationMs: number,
): Date | undefined => {
  const periodWindow = getDepositLimitPeriodWindow(
    data,
    currentBlock,
    slotDurationMs,
  )
  if (!periodWindow) return undefined

  // Expired period: exceeding headroom starts a fresh lockdown from this mint.
  if (periodWindow.type === "expired") {
    return new Date(
      currentTimestamp + ASSET_LOCKDOWN_PERIOD_BLOCKS * slotDurationMs,
    )
  }

  if (periodWindow.durationMs > 0) {
    return new Date(currentTimestamp + periodWindow.durationMs)
  }

  return undefined
}

export const isNttMetered = (data: NttRateLimit): boolean => data.windowMs > 0

export const getNttUsagePercent = (data: NttRateLimit): number | null => {
  if (!isNttMetered(data) || data.limit === 0n) return null
  const used = data.limit - data.capacity
  if (used <= 0n) return 0
  const pct = Number((used * 100n) / data.limit)
  return clamp(pct, { min: 0, max: 100 })
}

export const getGlobalWithdrawLimitUsagePercent = (
  data: GlobalWithdrawLimit,
): number | null => {
  if (!data.configured || data.limit === 0n) return null
  const pct = (Number(data.used) / Number(data.limit)) * 100
  return clamp(pct, { min: 0, max: 100 })
}
