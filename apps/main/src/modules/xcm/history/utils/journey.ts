import {
  AlertCircleIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@galacticcouncil/ui/assets/icons"
import { SpinnerIcon } from "@galacticcouncil/ui/components"
import { ThemeToken } from "@galacticcouncil/ui/theme"
import { isH160Address } from "@galacticcouncil/utils"
import { XcJourney } from "@galacticcouncil/xc-scan"

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

  return { from: from.toLowerCase(), to: to.toLowerCase() }
}
