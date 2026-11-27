import { neckwork } from "@galacticcouncil/utils"
import {
  authPathOf,
  decodeTerms,
  DEFAULT_DISPATCHER,
  DESTINATION_ASSETS,
  type Terms,
} from "@galacticcouncil/xc-intents"
import { type Address, bytesToHex, decodeAbiParameters, type Hex } from "viem"

import type { AccountIntentEntry } from "@/api/intents"
import type { XcScanOrder, XcScanPayout, XcScanTrade } from "@/api/xcIntents"
import {
  getXcTwapInfo,
  isDcaScheduleOrder,
  isIntentOrder,
  type OrderData,
} from "@/modules/trade/orders/lib/orderData"
import { scaleHuman } from "@/utils/formatting"

export type XcTwapForward = {
  readonly terms: Terms
  readonly authPath: Hex
  readonly depositAddress: Address
  readonly maxRelayFee: bigint
}

const FORWARD_PARAMS = [
  { type: "address" },
  { type: "uint256" },
  { type: "bytes" },
] as const

export const xcTwapOf = (
  intent: AccountIntentEntry["intent"],
): XcTwapForward | null => {
  const forward = intent.on_resolved
  if (intent.data.type !== "Dca" || forward?.type !== "Forward") return null
  if (forward.value.contract.toLowerCase() !== DEFAULT_DISPATCHER) return null

  try {
    const [depositAddress, maxRelayFee, packed] = decodeAbiParameters(
      FORWARD_PARAMS,
      bytesToHex(forward.value.data),
    )

    return {
      terms: decodeTerms(packed),
      authPath: authPathOf(packed),
      depositAddress,
      maxRelayFee,
    }
  } catch {
    return null
  }
}

const XC_SCAN_URL = "https://scan.play.hydration.cloud"

export const getXcScanTradeLink = (authPath: string) =>
  `${XC_SCAN_URL}/v2/trade/${authPath}`

/** Where "Open in explorer" goes: scan for xc TWAPs, neckwork for the rest. */
export const getOrderExplorerLink = (order: OrderData): string | null => {
  const xc = getXcTwapInfo(order)
  if (xc) return getXcScanTradeLink(xc.authPath)
  // isDcaScheduleOrder first: a merged row answers yes to both guards
  if (isDcaScheduleOrder(order)) return neckwork.activityDca(order.scheduleId)
  if (isIntentOrder(order)) return neckwork.intent(order.intentId)
  return null
}

/** Destination units bought so far: paid out (`received`) plus not yet paid out (`held`). */
export const getXcTwapReceived = (
  trade: Pick<XcScanTrade, "received" | "held">,
  decimals: number,
): string =>
  scaleHuman(BigInt(trade.received) + BigInt(trade.held ?? 0), decimals)

/** Hydration extrinsic that published the order, from scan's `<block>-<index>`. */
export const getXcOrderTxLink = (
  order: Pick<XcScanOrder, "published">,
): string | null => {
  const match = order.published?.extrinsic?.match(/^(\d+)-(\d+)$/)
  return match ? neckwork.extrinsic(Number(match[1]), Number(match[2])) : null
}

const DEST_TX_URLS: Record<string, string> = {
  [DESTINATION_ASSETS.ZEC]: "https://3xpl.com/zcash/transaction/",
  [DESTINATION_ASSETS.BTC]: "https://blockchair.com/bitcoin/transaction/",
}

/** The payout's ZEC / BTC tx once it exists, else its NEAR tx. */
export const getXcPayoutTxLink = (
  destinationAsset: string,
  payout: Pick<XcScanPayout, "state" | "dest_tx" | "signed">,
): string | null => {
  const destTxUrl = DEST_TX_URLS[destinationAsset]
  if (payout.state === "delivered" && destTxUrl && payout.dest_tx) {
    return `${destTxUrl}${payout.dest_tx}`
  }
  return payout.signed?.txHash
    ? `https://nearblocks.io/txns/${payout.signed.txHash}`
    : null
}

const ETH = { symbol: "ETH", decimals: 18 }

/** Net payout in destination units (gross until confirmed); refunds are wei, shown in ETH. */
export const getXcPayoutAmount = (
  payout: Pick<XcScanPayout, "state" | "amount" | "dest_amount">,
  destination: { readonly symbol: string; readonly decimals: number } | null,
): { value: string; symbol: string } | null => {
  if (payout.state === "refunded") {
    return {
      value: scaleHuman(payout.amount, ETH.decimals),
      symbol: ETH.symbol,
    }
  }
  if (!destination) return null

  return {
    value: scaleHuman(
      payout.dest_amount ?? payout.amount,
      destination.decimals,
    ),
    symbol: destination.symbol,
  }
}
