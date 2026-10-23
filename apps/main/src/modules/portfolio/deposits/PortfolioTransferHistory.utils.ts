import type { XcJourney } from "@galacticcouncil/xc-scan"

import { resolveChainFromUrn } from "@/modules/xcm/history/utils/claim"
import {
  FAILED_STATUSES,
  PENDING_STATUSES,
  SUCCESS_STATUSES,
  WAITING_STATUSES,
} from "@/modules/xcm/history/utils/journey"

export type PortfolioTransferFilter =
  | "all"
  | "pending"
  | "completed"
  | "attention"

export const filterPortfolioTransferHistory = (
  journeys: readonly XcJourney[],
  filter: PortfolioTransferFilter,
  search: string,
): XcJourney[] => {
  const query = search.trim().toLowerCase()
  return journeys.filter((journey) => {
    const pending = PENDING_STATUSES.includes(journey.status)
    const waiting = WAITING_STATUSES.includes(journey.status)
    if (filter === "pending" && !pending && !waiting) return false
    if (filter === "completed" && !SUCCESS_STATUSES.includes(journey.status))
      return false
    if (
      filter === "attention" &&
      !waiting &&
      !FAILED_STATUSES.includes(journey.status)
    )
      return false
    if (!query) return true

    return [
      ...journey.assets.map((asset) => asset.symbol ?? ""),
      resolveChainFromUrn(journey.origin)?.name ?? journey.origin,
      resolveChainFromUrn(journey.destination)?.name ?? journey.destination,
      journey.from,
      journey.to,
      journey.fromFormatted,
      journey.toFormatted,
      journey.status,
      journey.originProtocol,
      journey.destinationProtocol,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query)
  })
}
