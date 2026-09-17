import type {
  DcaStatus,
  IntentEvent,
  IntentStatus,
} from "@galacticcouncil/indexer/neckwork"
import type { ActivityType } from "@galacticcouncil/utils"

import { OrderStatus } from "@/modules/trade/orders/lib/orderData"
import { DcaScheduleStatus } from "@/modules/trade/orders/lib/types"

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

export const toApiDcaStatuses = (
  statuses: ReadonlyArray<DcaScheduleStatus>,
): ReadonlyArray<DcaStatus> =>
  statuses.map((status) => API_STATUS_BY_DCA_SCHEDULE_STATUS[status])

const ORDER_STATUS_BY_INTENT_STATUS = {
  open: OrderStatus.Created,
  /** A partial resolution leaves the remainder resting — still an open order. */
  partially_filled: OrderStatus.Created,
  filled: OrderStatus.Completed,
  completed: OrderStatus.Completed,
  cancelled: OrderStatus.Cancelled,
  expired: OrderStatus.Expired,
} satisfies Record<IntentStatus, OrderStatus>

/**
 * Must keep agreeing with `toIntentOrderStatus` (lib/orderData.ts), which maps
 * the fork path's lark event names onto the same enum. Change one, change both,
 * or the same order is labelled two ways depending on the RPC.
 */
export const toOrderStatusFromIntent = (status: IntentStatus): OrderStatus =>
  ORDER_STATUS_BY_INTENT_STATUS[status]

/**
 * One-to-many: the API splits states the app deliberately collapses. Terminated
 * and MigrationCancelled are schedule-only and no intent can be in them.
 */
const API_STATUSES_BY_ORDER_STATUS = {
  [OrderStatus.Created]: ["open", "partially_filled"],
  [OrderStatus.Completed]: ["filled", "completed"],
  [OrderStatus.Cancelled]: ["cancelled"],
  [OrderStatus.Expired]: ["expired"],
  [OrderStatus.Terminated]: [],
  [OrderStatus.MigrationCancelled]: [],
} satisfies Record<OrderStatus, ReadonlyArray<IntentStatus>>

export const toApiIntentStatuses = (
  statuses: ReadonlyArray<OrderStatus>,
): ReadonlyArray<IntentStatus> =>
  statuses.flatMap((status) => API_STATUSES_BY_ORDER_STATUS[status])

/**
 * The explorer publishes five intent activity slugs; the API reports eight
 * event kinds. `dca_completed` and `callback_failed` have no page of their own —
 * they get null, and the caller renders no link rather than a wrong one.
 */
const ACTIVITY_SLUG_BY_INTENT_EVENT = {
  submitted: "intent-place",
  resolved: "intent-fill",
  partially_resolved: "intent-fill",
  dca_trade: "intent-dca-trade",
  cancelled: "intent-cancel",
  expired: "intent-expire",
  dca_completed: null,
  callback_failed: null,
} satisfies Record<IntentEvent["kind"], ActivityType | null>

export const toIntentActivitySlug = (
  kind: IntentEvent["kind"],
): ActivityType | null => ACTIVITY_SLUG_BY_INTENT_EVENT[kind]
