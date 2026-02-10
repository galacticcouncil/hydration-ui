import {
  CheckIcon,
  ClockIcon,
  TriangleAlert,
} from "@galacticcouncil/ui/assets/icons"
import { ThemeToken } from "@galacticcouncil/ui/theme"
import { XcJourney } from "@galacticcouncil/xc-scan"

export type TJourneyStatus = XcJourney["status"]

export const PENDING_STATUSES: TJourneyStatus[] = ["sent", "pending", "waiting"]
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
      icon: ClockIcon,
    }
  }
  if (SUCCESS_STATUSES.includes(status)) {
    return {
      color: "accents.success.emphasis",
      icon: CheckIcon,
    }
  }

  if (FAILED_STATUSES.includes(status)) {
    return {
      color: "accents.danger.secondary",
      icon: TriangleAlert,
    }
  }

  return {
    color: "text.medium",
    icon: null,
  }
}
