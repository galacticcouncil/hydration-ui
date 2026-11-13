import z from "zod/v4"

import type {
  DepositsResponse,
  OnrampAccountsResponse,
  OnrampAccountView,
  OnrampCurrency,
} from "@/modules/onramp/bank/config/schemas"
import { HbrApiError } from "@/modules/onramp/bank/utils/hbrErrors"
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
  | { kind: "notReady" | "support" | "conflict" }
  | { kind: BankErrorKind }

const refusalBodySchema = z.object({
  gate: z.string().nullable().optional(),
  reason: z.string().nullable().optional(),
})

/** How a failed on-ramp request or re-arm is shown (API doc 4). */
export const classifyOnrampError = (error: unknown): OnrampErrorView => {
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
 * GET /v1/onramp/accounts is limited to 6 a minute per wallet (API doc 1).
 * The screen's only other caller of the route is the re-read after a request
 * or re-arm. While an account is `preparing`, 12 s polls (5 a minute) plus
 * that re-read stay within 6; otherwise 20 s. After a 429 the next poll waits
 * a full window: a backoff, never shown as a failure.
 */
export const ONRAMP_POLL_MS = {
  preparing: 12_000,
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
 * What the account header says. A 429 is a backoff: a non-ready status stays
 * as it was read; a ready one says it is being checked again (its
 * instructions stay hidden, rule 5). Any other failed read says so.
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
  if (isRateLimited(query.error) && view)
    return view.status === "ready"
      ? { kind: "rechecking" }
      : { kind: "status", view }
  return { kind: "failed" }
}
