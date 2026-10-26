import type { XcJourney } from "@galacticcouncil/xc-scan"

import type { XcScanChains } from "@/api/xcScanMetadata"
import {
  FAILED_STATUSES,
  PENDING_STATUSES,
  SUCCESS_STATUSES,
  WAITING_STATUSES,
} from "@/modules/xcm/history/utils/journey"
import { getJourneyChainName } from "@/modules/xcm/history/utils/metadata"

export type PortfolioTransferFilter =
  | "all"
  | "pending"
  | "completed"
  | "attention"

export const filterPortfolioTransferHistory = (
  journeys: readonly XcJourney[],
  filter: PortfolioTransferFilter,
  search: string,
  chains: XcScanChains = {},
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
      getJourneyChainName(journey.origin, chains),
      getJourneyChainName(journey.destination, chains),
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
