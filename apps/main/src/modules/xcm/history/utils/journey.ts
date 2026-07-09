import {
  AlertCircleIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@galacticcouncil/ui/assets/icons"
import { SpinnerIcon } from "@galacticcouncil/ui/components"
import { ThemeToken } from "@galacticcouncil/ui/theme"
import { isH160Address } from "@galacticcouncil/utils"
import { XcJourney } from "@galacticcouncil/xc-scan"
import { isNonNullish, sortBy } from "remeda"

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

const getJourneyOriginTxHashes = (journey: XcJourney): string[] => {
  return [journey.originTxPrimary, journey.originTxSecondary].filter(
    (hash): hash is string => !!hash,
  )
}

/**
 * Journeys submitted by the same origin transaction are the same logical
 * journey - the indexer re-keys a journey to a new correlation id
 * mid-flight (e.g. when the wormhole leg starts on Moonbeam).
 */
export function journeysShareOriginTx(a: XcJourney, b: XcJourney): boolean {
  const hashes = getJourneyOriginTxHashes(a)
  return getJourneyOriginTxHashes(b).some((hash) => hashes.includes(hash))
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
