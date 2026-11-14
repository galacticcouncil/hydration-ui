import z from "zod/v4"

import type {
  DepositsResponse,
  OnrampAccountsResponse,
  OnrampAccountView,
  OnrampCurrency,
} from "@/modules/onramp/bank/config/schemas"
import {
  HbrApiError,
  HbrNetworkError,
} from "@/modules/onramp/bank/utils/hbrErrors"
import {
  BankErrorKind,
  classifyBankError,
} from "@/modules/onramp/bank/utils/onboarding"

/** The one view of `currency`; none, or more than one (malformed), reads null: fail closed. */
export const findOnrampAccount = (
  data: OnrampAccountsResponse | undefined,
  currency: OnrampCurrency,
): OnrampAccountView | null => {
  const views =
    data?.accounts.filter((account) => account.currency === currency) ?? []
  return views.length === 1 ? (views[0] ?? null) : null
}

/**
 * Deposit instructions to show, or null (API doc rule 5): only from the
 * latest read, only on a `ready` view, never after a failed read. A later
 * read with another status (or a failed one) removes them at once.
 */
export const getVisibleInstructions = (
  query: { data: OnrampAccountsResponse | undefined; error: unknown },
  currency: OnrampCurrency,
) => {
  if (query.error) return null
  const view = findOnrampAccount(query.data, currency)
  if (!view || view.status !== "ready" || !view.instructions) return null
  return {
    instructions: view.instructions,
    minimumDeposit: view.minimumDeposit,
  }
}

/** Rule 6: the re-arm action is offered on `retryAllowed` ALONE, whatever the status. */
export const canRetryOnrampAccount = (view: OnrampAccountView | null) =>
  view?.retryAllowed === true

/** Rule 5 of the request: the "get bank details" action is for an account never requested. */
export const canRequestOnrampAccount = (view: OnrampAccountView | null) =>
  view?.status === "not_requested"

export type OnrampErrorView =
  | { kind: "railUnavailable"; gate: string | null }
  | { kind: "retryNotAllowed"; reason: string | null }
  | { kind: "notReady" | "support" | "conflict" | "unconfirmed" }
  | { kind: BankErrorKind }

const refusalBodySchema = z.object({
  gate: z.string().nullable().optional(),
  reason: z.string().nullable().optional(),
})

/** How a failed on-ramp request or re-arm is shown (API doc 4). */
export const classifyOnrampError = (error: unknown): OnrampErrorView => {
  // No answer (network or timeout) to a POST: it may have been carried out.
  if (error instanceof HbrNetworkError) return { kind: "unconfirmed" }
  if (error instanceof HbrApiError) {
    const body = refusalBodySchema.safeParse(error.body).data
    switch (error.code) {
      case "rail_unavailable":
        return { kind: "railUnavailable", gate: body?.gate ?? null }
      case "retry_not_allowed":
        return { kind: "retryNotAllowed", reason: body?.reason ?? null }
      case "customer_required":
      case "wallet_not_bound":
        return { kind: "notReady" }
      case "onramp_needs_attention":
      case "onramp_account_not_found":
        return { kind: "support" }
      case "conflict":
        return { kind: "conflict" }
    }
  }
  return { kind: classifyBankError(error) }
}

// ---- Deposit history ---------------------------------------------------

/**
 * USDC base units (6 dp, a decimal string) as an exact decimal string, never
 * through a float: "60000000" -> "60", "500000" -> "0.5". Null for anything
 * that is not a base-unit string.
 */
export const formatUsdcBaseUnits = (value: string): string | null => {
  if (!/^\d+$/.test(value)) return null
  const padded = value.padStart(7, "0")
  const whole = padded.slice(0, -6).replace(/^0+(?=\d)/, "")
  const fraction = padded.slice(-6).replace(/0+$/, "")
  return fraction ? `${whole}.${fraction}` : whole
}

type DepositEntry = DepositsResponse["deposits"][number]

/**
 * The bank amount line of a deposit, or null. Rule 17: a EUR deposit shows
 * USDC only, so Bridge's EUR `amount` is never shown. A USD amount says
 * "received by Bridge" only when Bridge's own `receivedAt` is set; otherwise
 * (for example `funds_scheduled`, in transit) it is a neutral transfer amount.
 */
export const getDepositAmountLine = (
  entry: DepositEntry,
): { amount: string; received: boolean } | null =>
  entry.currency === "usd"
    ? { amount: entry.amount, received: entry.receivedAt !== null }
    : null

// The detail codes of API doc 4 (GET /v1/onramp/deposits); a code token, not copy.
export const DEPOSIT_DETAIL_CODES = [
  "mint_cancelled",
  "mint_amount_mismatch",
  "below_flush_minimum",
  "flush_state_unreadable",
  "chain_inconsistent",
  "bridge_refund_after_arrival",
  "tx_shared",
  "tx_multiple_inflows",
  "refund_after_send",
  "no_destination_tx",
  "funds_scheduled",
  "refund_unobserved",
  "refund_failed",
  "bridge_state_unknown",
  "bridge_history_unread",
] as const

/** The copy key of a detail code; an unknown code gets the generic one. */
export const getDepositDetailKey = (
  detail: string | null,
): (typeof DEPOSIT_DETAIL_CODES)[number] | "other" | null =>
  detail === null
    ? null
    : (DEPOSIT_DETAIL_CODES as readonly string[]).includes(detail)
      ? (detail as (typeof DEPOSIT_DETAIL_CODES)[number])
      : "other"

// ---- On-ramp account polling and header ---------------------------------

export const isRateLimited = (error: unknown) =>
  error instanceof HbrApiError && error.status === 429

/**
 * GET /v1/onramp/accounts is limited by the server to 6 a minute per wallet
 * (API doc 1). This screen does not hold that limit. Its schedule alone reads
 * every 15 s while an account is `preparing` (4 a minute) and every 20 s
 * otherwise (3 a minute); every mount and every settled request or re-arm adds
 * one read, so the screen can pass 6. The server then answers 429:
 * instructions are hidden (rule 5), nothing reads as failed, and the next
 * scheduled read is 60 s later.
 */
export const ONRAMP_POLL_MS = {
  preparing: 15_000,
  settled: 20_000,
  rateLimited: 60_000,
} as const

export const getOnrampPollInterval = (
  data: OnrampAccountsResponse | undefined,
  error: unknown,
) =>
  isRateLimited(error)
    ? ONRAMP_POLL_MS.rateLimited
    : data?.accounts.some((account) => account.status === "preparing")
      ? ONRAMP_POLL_MS.preparing
      : ONRAMP_POLL_MS.settled

/**
 * What the account header says. A 429 is a backoff, never a failure: with no
 * answer yet, or on a ready account, it says the details are checked again
 * shortly (instructions stay hidden, rule 5); a non-ready status stays as it
 * was read. Any other failed read says so.
 */
export const getOnrampHeader = (
  query: { data: OnrampAccountsResponse | undefined; error: unknown },
  currency: OnrampCurrency,
):
  | { kind: "status"; view: OnrampAccountView }
  | { kind: "rechecking" }
  | { kind: "failed" }
  | null => {
  const view = findOnrampAccount(query.data, currency)
  if (!query.error) return view ? { kind: "status", view } : null
  if (isRateLimited(query.error))
    return view && view.status !== "ready"
      ? { kind: "status", view }
      : { kind: "rechecking" }
  return { kind: "failed" }
}

// ---- Stage 4: rail labels and the deposit timeline ----------------------

// Bridge's payment-rail tokens we know a name for (hbr-bridge-xyz skill);
// any other token is shown exactly as the server returned it.
const RAIL_NAMES: Record<string, string> = {
  ach: "ACH",
  ach_push: "ACH",
  wire: "Wire",
  fednow: "FedNow",
  sepa: "SEPA",
}

/** Human rail names, in order, duplicates dropped (ach and ach_push both read ACH). */
export const getRailLabels = (rails: ReadonlyArray<string>): string[] => [
  ...new Set(
    rails.map((rail) =>
      Object.prototype.hasOwnProperty.call(RAIL_NAMES, rail)
        ? RAIL_NAMES[rail]!
        : rail,
    ),
  ),
]

/**
 * The deposit timeline (Figma D08-D13, pattern P04): the 5.3 statuses a
 * deposit moves through, in order, with the 5.3 labels as stage names
 * (`DEPOSIT_LABELS`, server/lib/onramp/depositAttribution.mjs:89, copied, not
 * ours; orchestrator decision 2026-11-13: the API doc has no deposit stage
 * table, and the Figma D08-D13 frames use these same names). `waiting_deposit_limit` stands on the Depositing stage (arrived on
 * Base, not deposited yet). `returned`, `checking`, `needs_attention` and any
 * status not listed are off-timeline: no stage is lit, the label says it.
 */
export const DEPOSIT_TIMELINE = [
  { status: "received_by_bridge", name: "Received by Bridge" },
  { status: "sent_to_base", name: "Sent to Base" },
  { status: "arrived", name: "Arrived" },
  { status: "depositing", name: "Depositing" },
  { status: "queued_on_hydration", name: "Queued on Hydration" },
  { status: "credited", name: "Credited" },
] as const

const DEPOSIT_STAGE_OF: Record<string, number> = {
  received_by_bridge: 1,
  sent_to_base: 2,
  arrived: 3,
  depositing: 4,
  waiting_deposit_limit: 4,
  queued_on_hydration: 5,
  credited: 6,
}

/** Stages a deposit status lights (0 = off-timeline); complete only on `credited` (rule 4). */
export const getDepositStage = (
  status: string,
): { lit: number; complete: boolean } => {
  const lit = Object.prototype.hasOwnProperty.call(DEPOSIT_STAGE_OF, status)
    ? DEPOSIT_STAGE_OF[status]!
    : 0
  return { lit, complete: status === "credited" }
}

/**
 * A pill colour per deposit status. OUR mapping, not the server's: 5.3 gives
 * deposits a label and no tone. Credited success, needs_attention attention,
 * returned and any unknown status neutral, the rest pending.
 */
export const getDepositTone = (
  status: string,
): "pending" | "attention" | "neutral" | "success" =>
  status === "credited"
    ? "success"
    : status === "needs_attention"
      ? "attention"
      : status === "returned"
        ? "neutral"
        : Object.prototype.hasOwnProperty.call(DEPOSIT_STAGE_OF, status) ||
            status === "checking"
          ? "pending"
          : "neutral"

// ---- Portfolio, Deposits filter chips -----------------------------------

export type TransferFilter = "all" | "inProgress" | "completed" | "attention"

/**
 * The chip a transfer falls under, derived from the server's status (ours: the
 * API has no grouping). Deposits: credited is completed, needs_attention needs
 * attention, returned is a final state under All only, every other status
 * (the pipeline, checking, an unknown later one: never an ending, rule 13) is
 * in progress. Cash-outs by the server's tone: success completed, attention
 * needs attention, neutral (cancelled, returned, not redeemed) All only,
 * pending and unknown in progress.
 */
export const getTransferGroup = (
  item: { kind: "deposit"; status: string } | { kind: "ramp"; tone: string },
): Exclude<TransferFilter, "all"> | null => {
  if (item.kind === "deposit")
    return item.status === "credited"
      ? "completed"
      : item.status === "needs_attention"
        ? "attention"
        : item.status === "returned"
          ? null
          : "inProgress"
  return item.tone === "success"
    ? "completed"
    : item.tone === "attention"
      ? "attention"
      : item.tone === "neutral"
        ? null
        : "inProgress"
}

export const matchesTransferFilter = (
  filter: TransferFilter,
  group: Exclude<TransferFilter, "all"> | null,
) => filter === "all" || group === filter
