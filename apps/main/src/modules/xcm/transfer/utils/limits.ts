import { clients } from "@galacticcouncil/xc-cfg"
import type {
  AssetDepositLimit,
  GlobalWithdrawLimit,
} from "@galacticcouncil/xc-cfg/build/clients/chain/hydration/circuit-breaker"
import { AnyChain, Asset, AssetRoute, Wormhole } from "@galacticcouncil/xc-core"
import type { WormholeRateLimit } from "@galacticcouncil/xc-sdk"
import { clamp } from "remeda"

import { XcmTag } from "@/states/transactions"

export enum XcmLimitAlertKey {
  DepositLocked = "depositLocked",
  DepositExceeded = "depositExceeded",
  GlobalWithdrawExceeded = "globalWithdrawExceeded",
  GlobalWithdrawLockdown = "globalWithdrawLockdown",
  WormholeBigTransaction = "wormholeBigTransaction",
  WormholeExceeded = "wormholeExceeded",
}

export const DEPOSIT_LIMIT_ALERT_KEYS: XcmLimitAlertKey[] = [
  XcmLimitAlertKey.DepositLocked,
  XcmLimitAlertKey.DepositExceeded,
]

export const GLOBAL_WITHDRAW_LIMIT_ALERT_KEYS: XcmLimitAlertKey[] = [
  XcmLimitAlertKey.GlobalWithdrawExceeded,
  XcmLimitAlertKey.GlobalWithdrawLockdown,
]

export const WORMHOLE_LIMIT_ALERT_KEYS: XcmLimitAlertKey[] = [
  XcmLimitAlertKey.WormholeBigTransaction,
  XcmLimitAlertKey.WormholeExceeded,
]

const { ASSET_LOCKDOWN_PERIOD_BLOCKS } = clients

export const hasXcmLimitAlertKey = (
  key: string,
  keys: XcmLimitAlertKey[],
): key is XcmLimitAlertKey => (keys as string[]).includes(key)

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

const findWormholeTransactChain = (
  routes: AssetRoute[],
  bridgeTag?: string | null,
): AnyChain | undefined => {
  const tagged = bridgeTag
    ? routes.filter((r) => r.tags?.includes(bridgeTag))
    : routes
  const wormholeRoute = tagged.find(
    (r) =>
      r.tags?.includes(XcmTag.Wormhole) &&
      r.transact?.chain &&
      Wormhole.isKnown(r.transact.chain),
  )
  return wormholeRoute?.transact?.chain
}

export const getWormholeEmitterChain = (
  srcChain: AnyChain | null,
  route?: AssetRoute,
  options?: { routes?: AssetRoute[]; bridgeTag?: string | null },
): AnyChain | undefined => {
  if (srcChain && Wormhole.isKnown(srcChain)) return srcChain
  if (route?.transact?.chain && Wormhole.isKnown(route.transact.chain)) {
    return route.transact.chain
  }
  if (options?.routes?.length) {
    return findWormholeTransactChain(options.routes, options.bridgeTag)
  }
  return undefined
}

export const getWormholeEmitterId = (
  srcChain: AnyChain | null,
  route?: AssetRoute,
  options?: { routes?: AssetRoute[]; bridgeTag?: string | null },
): number | null => {
  const emitterChain = getWormholeEmitterChain(srcChain, route, options)
  return emitterChain ? Wormhole.fromChain(emitterChain).getWormholeId() : null
}

export type WormholeTokenOrigin = {
  wormholeChainId: number
  originAddress: string
}

export const getWormholeTokenOrigins = (
  chains: Iterable<AnyChain>,
  asset: Asset,
): WormholeTokenOrigin[] => {
  const origins: WormholeTokenOrigin[] = []
  for (const chain of chains) {
    if (!Wormhole.isKnown(chain) || !chain.getAsset(asset.key)) continue
    const wormhole = Wormhole.fromChain(chain)
    try {
      origins.push({
        wormholeChainId: wormhole.getWormholeId(),
        originAddress: wormhole.normalizeAddress(
          String(chain.getAssetId(asset)),
        ),
      })
    } catch {
      continue
    }
  }
  return origins
}

export const getGovernorUsagePercent = (
  data: WormholeRateLimit,
): number | null => {
  if (!data.configured || data.notionalLimit === 0) return null
  const used = data.notionalLimit - data.availableNotional
  const pct = (used / data.notionalLimit) * 100
  return clamp(pct, { min: 0, max: 100 })
}

export const getGlobalWithdrawLimitUsagePercent = (
  data: GlobalWithdrawLimit,
): number | null => {
  if (!data.configured || data.limit === 0n) return null
  const pct = (Number(data.used) / Number(data.limit)) * 100
  return clamp(pct, { min: 0, max: 100 })
}
