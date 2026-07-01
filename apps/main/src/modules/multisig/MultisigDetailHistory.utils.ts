import {
  isMultisigHistoryRejection,
  type MultisigHistoryStatus,
} from "@/api/multisig"
import type {
  MultisigDetailHistoryEvent,
  MultisigDetailHistoryGroup,
  MultisigDetailHistoryRawEvent,
  MultisigDetailHistoryTableRow,
} from "@/modules/multisig/MultisigDetailHistory.columns"

const resolveApprovalStatus = (
  approvalIndex: number,
  threshold: number,
): MultisigHistoryStatus => {
  if (approvalIndex === 1) return "proposed"
  if (approvalIndex >= threshold) return "executed"
  if (threshold >= 3) return "approved"
  return "executed"
}

export const assignMultisigHistoryEventStatuses = (
  events: ReadonlyArray<MultisigDetailHistoryRawEvent>,
  threshold: number,
): MultisigDetailHistoryEvent[] => {
  let approvalIndex = 0

  return events.map((event) => {
    if (isMultisigHistoryRejection(event.decodedTx)) {
      return { ...event, status: "rejected" as const }
    }

    approvalIndex += 1
    return {
      ...event,
      status: resolveApprovalStatus(approvalIndex, threshold),
    }
  })
}

export const aggregateMultisigHistoryStatus = (
  statuses: ReadonlyArray<MultisigHistoryStatus>,
): MultisigHistoryStatus => {
  if (statuses.includes("rejected")) return "rejected"
  if (statuses.includes("executed")) return "executed"
  if (statuses.includes("approved")) return "approved"
  if (statuses.includes("proposed")) return "proposed"
  return "proposed"
}

export const groupMultisigHistoryByProposal = (
  events: ReadonlyArray<MultisigDetailHistoryRawEvent>,
  threshold: number,
): MultisigDetailHistoryGroup[] => {
  const groups = Map.groupBy(events, (event) => event.proposalKey)

  return Array.from(groups.values())
    .map((groupEvents) => {
      const sortedRawEvents = [...groupEvents].sort(
        (a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0),
      )
      const sortedEvents = assignMultisigHistoryEventStatuses(
        sortedRawEvents,
        threshold,
      )
      const statuses = sortedEvents.map((event) => event.status)
      const approvalCount = sortedEvents.filter(
        (event) => event.status !== "rejected",
      ).length

      return {
        id: sortedEvents[0]?.proposalKey ?? "",
        methodName: sortedEvents[0]?.methodName ?? "",
        status: aggregateMultisigHistoryStatus(statuses),
        approvalCount,
        threshold,
        timestamp: sortedEvents.at(-1)?.timestamp ?? null,
        events: sortedEvents,
        isLoading: sortedEvents.some((event) => event.isLoading),
      }
    })
    .sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0))
}

export const groupMultisigHistoryByDate = (
  rows: ReadonlyArray<MultisigDetailHistoryGroup>,
): MultisigDetailHistoryTableRow[] => {
  return Array.from(
    Map.groupBy(rows, (row) => {
      if (!row.timestamp) return

      const date = new Date(row.timestamp)

      /* remove timezone offset to get date time in user's timezone that acts as UTC so it can be grouped by it*/
      return new Date(date.valueOf() - date.getTimezoneOffset() * 60 * 1000)
        .toISOString()
        .split("T")[0]
    })
      .entries()
      .flatMap<MultisigDetailHistoryTableRow>(([date, dayRows]) => {
        if (!date) {
          return dayRows
        }

        const dateOnly = new Date(date)
        // add timezone offset back to preserve the original date in UTC, otherwise the date might shift due to timezone
        const dt = new Date(
          dateOnly.valueOf() + dateOnly.getTimezoneOffset() * 60 * 1000,
        )

        return [dt, ...dayRows]
      }),
  )
}

export const getMultisigHistoryGroupSubscanHref = (
  group: MultisigDetailHistoryGroup,
) => {
  const executedEvent = group.events.find(
    (event) => event.status === "executed",
  )
  const targetEvent = executedEvent ?? group.events.at(-1)
  return targetEvent?.call.blockHash
}
