import {
  AlertCircleIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@galacticcouncil/ui/assets/icons"
import { SpinnerIcon } from "@galacticcouncil/ui/components"
import { ThemeToken } from "@galacticcouncil/ui/theme"
import {
  getChainId,
  isH160Address,
  stringEquals,
  transferscan,
  xcscan,
} from "@galacticcouncil/utils"
import { AnyChain, ChainEcosystem } from "@galacticcouncil/xc-core"
import { XcJourney, XcOcnUrn } from "@galacticcouncil/xc-scan"
import { isNonNullish, sortBy } from "remeda"

import { XC_SWAP_CONFIG } from "@/config/xcSwap"

export const NEAR_CHAIN_KEY = "near"

// xc-scan names NEAR by the id it maps wormhole chain 15 to, not by the chain
// key. near_testnet shares that wormhole id, but only mainnet is indexed.
export const XCSCAN_NEAR_ID = "397"

/** Journeys read from the transfers scan, keyed by its transfer id after it. */
export const SCAN_JOURNEY_PREFIX = "scan:"

export type TJourneyStatus = XcJourney["status"]

export type XcJourneyWhVAAInstruction = {
  type: "WormholeVAA"
  value: {
    raw: string
    guardianSetIndex: number
    isDuplicated: boolean
  }
}
export type XcJourneyWhStop = {
  type: "wormhole"
  from: object
  to: object
  relay?: object
  instructions: XcJourneyWhVAAInstruction
  messageId?: string
}

export type XcJourneyGenericStop = {
  type: string
  from: object
  to: object
  relay?: object
  instructions: object[]
  messageId?: string
}

export type XcJourneyStop = XcJourneyGenericStop | XcJourneyWhStop

export const PENDING_STATUSES: TJourneyStatus[] = ["sent", "pending"]
export const WAITING_STATUSES: TJourneyStatus[] = ["waiting"]
export const SUCCESS_STATUSES: TJourneyStatus[] = [
  "received",
  "success",
  "completed",
  "confirmed",
]
export const FAILED_STATUSES: TJourneyStatus[] = ["fail", "failed", "timeout"]

export const getStatusProps = (
  status: TJourneyStatus,
): {
  color: ThemeToken
  icon: React.ComponentType | null
} => {
  if (PENDING_STATUSES.includes(status)) {
    return {
      color: "controls.solid.accent",
      icon: SpinnerIcon,
    }
  }
  if (WAITING_STATUSES.includes(status)) {
    return {
      color: "controls.solid.accent",
      icon: ClockIcon,
    }
  }
  if (SUCCESS_STATUSES.includes(status)) {
    return {
      color: "accents.success.emphasis",
      icon: CheckCircleIcon,
    }
  }

  if (FAILED_STATUSES.includes(status)) {
    return {
      color: "accents.danger.secondary",
      icon: AlertCircleIcon,
    }
  }

  return {
    color: "text.medium",
    icon: null,
  }
}

export function getFormattedAddresses(journey: XcJourney) {
  const from = isH160Address(journey.from)
    ? journey.from
    : journey.fromFormatted || ""
  const to = isH160Address(journey.to) ? journey.to : journey.toFormatted || ""

  return { from, to }
}

export const journeyDate = (j: XcJourney) => j.sentAt ?? j.createdAt ?? 0

export function isXcSwapReceiverJourney(journey: XcJourney): boolean {
  return stringEquals(journey.to ?? "", XC_SWAP_CONFIG.receiver)
}

export function getVisibleJourneys(journeys: XcJourney[]): XcJourney[] {
  return journeys.filter((j) => !isXcSwapReceiverJourney(j))
}

export function getJourneyExplorerLink(journey: XcJourney): string {
  const { correlationId } = journey

  // xc-scan doesn't know a journey read from the transfers scan
  if (correlationId.startsWith(SCAN_JOURNEY_PREFIX)) {
    return transferscan.transfer(
      correlationId.slice(SCAN_JOURNEY_PREFIX.length),
    )
  }

  return xcscan.tx(correlationId)
}

export function mergeJourneys(
  existing: XcJourney[],
  incoming: XcJourney[],
): XcJourney[] {
  const seen = new Set(
    existing.map((j) => j.originTxPrimary).filter(isNonNullish),
  )
  const filtered = incoming.filter(
    (j) => !j.originTxPrimary || !seen.has(j.originTxPrimary),
  )

  if (filtered.length === 0) {
    return existing
  }

  return sortBy([...existing, ...filtered], [journeyDate, "desc"])
}

export function getChainXcScanUrn(chain: AnyChain): XcOcnUrn {
  const ecosystem = chain.ecosystem
  if (!ecosystem) return "" as XcOcnUrn
  const chainId =
    chain.key === NEAR_CHAIN_KEY ? XCSCAN_NEAR_ID : getChainId(chain)
  return `urn:ocn:${ecosystem.toLowerCase()}:${chainId}` as XcOcnUrn
}

/**
 * Chain id of an xc-scan network as getChainId reports it, which is what
 * chain logos are keyed by.
 */
export function fromXcScanChainId(network: {
  ecosystem: ChainEcosystem
  chainId: string
}): string {
  const { ecosystem, chainId } = network
  return ecosystem === ChainEcosystem.Near && chainId === XCSCAN_NEAR_ID
    ? NEAR_CHAIN_KEY
    : chainId
}
