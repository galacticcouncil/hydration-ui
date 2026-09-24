import { DcaStatus } from "@galacticcouncil/indexer/neckwork"

import { DcaScheduleStatus } from "@/modules/trade/orders/lib/types"

// The API uses lowercase strings, the app uses PascalCase enums. Both tables
// use `satisfies` instead of a type annotation, which keeps the literal key
// set. A missing or misspelled key then fails the build instead of rendering
// "unknown" at runtime.
const DCA_SCHEDULE_STATUS_BY_API = {
  created: DcaScheduleStatus.Created,
  completed: DcaScheduleStatus.Completed,
  terminated: DcaScheduleStatus.Terminated,
  cancelled: DcaScheduleStatus.Cancelled,
} satisfies Record<DcaStatus, DcaScheduleStatus>

const API_STATUS_BY_DCA_SCHEDULE_STATUS = {
  [DcaScheduleStatus.Created]: "created",
  [DcaScheduleStatus.Completed]: "completed",
  [DcaScheduleStatus.Terminated]: "terminated",
  [DcaScheduleStatus.Cancelled]: "cancelled",
} satisfies Record<DcaScheduleStatus, DcaStatus>

export const toDcaScheduleStatus = (status: DcaStatus): DcaScheduleStatus =>
  DCA_SCHEDULE_STATUS_BY_API[status]

/** dcaSchedulesQuery filters on the API vocabulary, so app enums convert back. */
export const toApiDcaStatuses = (
  statuses: ReadonlyArray<DcaScheduleStatus>,
): ReadonlyArray<DcaStatus> =>
  statuses.map((status) => API_STATUS_BY_DCA_SCHEDULE_STATUS[status])
