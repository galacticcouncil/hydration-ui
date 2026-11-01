import type { XcJourney } from "@galacticcouncil/xc-scan"
import Big from "big.js"

import type { DepositBalanceRow } from "@/modules/onramp/deposit/DepositDiscovery.utils"
import type { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"

export const getDepositTokenProvenance = (bridgeTag?: string | null) => {
  switch (bridgeTag) {
    case "Wormhole":
    case "NttExecutor":
    case "Basejump":
      return "wormhole"
    case "Snowbridge":
    case "SnowbridgeV1":
      return "snowbridge"
    default:
      return null
  }
}

export const getDepositFeeReserve = (balance?: string, maximum?: string) => {
  if (!balance || !maximum) return undefined
  try {
    const reserved = Big(balance).minus(maximum)
    return Big(maximum).gte(0) && reserved.gt(0)
      ? reserved.toString()
      : undefined
  } catch {
    return undefined
  }
}

/** Uses the native route's published estimate; routes without one stay unknown. */
export const getDepositExpectedDuration = (estimate?: string) => {
  const match = estimate?.match(/([\d.]+)\s*(sec|min|hour|hr)/i)
  if (!match) return undefined
  const unit = match[2]?.toLowerCase()
  const multiplier = unit === "sec" ? 1000 : unit === "min" ? 60000 : 3600000
  const duration = Number(match[1]) * multiplier
  return Number.isFinite(duration) && duration > 0 ? duration : undefined
}

export const getDepositTiming = (
  sentAt: number,
  now: number,
  expectedDuration?: number,
) => {
  const elapsed =
    Number.isFinite(sentAt) && Number.isFinite(now)
      ? Math.max(0, now - sentAt)
      : 0
  const expected =
    expectedDuration &&
    Number.isFinite(expectedDuration) &&
    expectedDuration > 0
      ? expectedDuration
      : undefined
  return {
    elapsed,
    remaining: expected ? Math.max(0, expected - elapsed) : undefined,
    delayed: !!expected && elapsed >= expected * 2,
  }
}

/** Never use an origin or intermediate asset as proof of the received amount. */
export const getDepositReceivedAsset = (
  journey?: Pick<XcJourney, "destination" | "assets">,
) => {
  const assets = [...(journey?.assets ?? [])]
    .filter(
      (asset) =>
        asset.role === "transfer" &&
        asset.asset.split("|")[0] === journey?.destination,
    )
    .sort((a, b) => (b.sequence ?? 0) - (a.sequence ?? 0))
  for (const asset of assets) {
    if (
      !asset.symbol ||
      typeof asset.decimals !== "number" ||
      !Number.isInteger(asset.decimals) ||
      asset.decimals < 0 ||
      asset.decimals > 100 ||
      !/^\d+$/.test(asset.amount)
    )
      continue
    return {
      amount: Big(asset.amount).div(Big(10).pow(asset.decimals)).toString(),
      symbol: asset.symbol,
    }
  }
  return undefined
}

/** Source changes keep the confirmed recipient, but never reuse the old route quote. */
export const getDepositSourceFormValues = (
  values: XcmFormValues,
  row: Pick<DepositBalanceRow, "source" | "balance">,
): XcmFormValues => ({
  ...values,
  srcChain: row.source.chain,
  srcAsset: row.balance,
  srcAmount: values.srcAsset?.key === row.balance.key ? values.srcAmount : "",
  destAsset: null,
  bridgeProvider: null,
  destAmount: "",
})
