import z from "zod/v4"

import type { CreateBankAccountRequest } from "@/modules/onramp/bank/config/schemas"
import {
  HbrApiError,
  HbrNetworkError,
  HbrResponseError,
} from "@/modules/onramp/bank/utils/hbrErrors"
import {
  BankErrorKind,
  classifyBankError,
} from "@/modules/onramp/bank/utils/onboarding"

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never

/** A request body without its `clientRequestId`, per rail. */
export type BankAccountBody = DistributiveOmit<
  CreateBankAccountRequest,
  "clientRequestId"
>

/** One form submission: its `clientRequestId` and the body it was made for. */
export type BankAccountSubmission = { clientRequestId: string; body: string }

// Keys sorted at every level, so the same values in another order match.
const canonical = (value: unknown): string =>
  JSON.stringify(value, (_key, v: unknown) =>
    v && typeof v === "object" && !Array.isArray(v)
      ? Object.fromEntries(
          Object.entries(v as Record<string, unknown>).sort(([a], [b]) =>
            a < b ? -1 : 1,
          ),
        )
      : v,
  )

/**
 * The `clientRequestId` for sending `body` (API doc 2 step 6): the pending
 * submission's id when the body is the same (a retry), else a new id (a new
 * submission). Reusing the id is what lets an unobserved outcome converge on
 * one account at the server.
 */
export const nextBankAccountSubmission = (
  pending: BankAccountSubmission | null,
  body: BankAccountBody,
  newId: () => string,
): BankAccountSubmission => {
  const key = canonical(body)
  return pending && pending.body === key
    ? pending
    : { clientRequestId: newId(), body: key }
}

/**
 * The submission ends (its id is dropped) on success and on
 * `client_request_id_reused`. Every other outcome keeps it, so repeating the
 * same body reuses the id: the server answers the same account, never a second.
 */
export const isBankAccountSubmissionDone = (outcome: unknown) =>
  outcome === "success" ||
  (outcome instanceof HbrApiError &&
    outcome.code === "client_request_id_reused")

const refusalBodySchema = z.object({
  gate: z.string().nullable().optional(),
  detail: z.string().optional(),
})

export type BankAccountErrorView =
  | { kind: "uncertain" }
  | { kind: "notSent" }
  | { kind: "railUnavailable"; gate: string | null }
  | { kind: "serverDetail"; detail: string }
  | {
      kind:
        | "nameUnavailable"
        | "idReused"
        | "contactSupport"
        | "rejected"
        | "invalid"
        | "notReady"
    }
  | { kind: BankErrorKind }

/** How a failed `POST /v1/bank-accounts` is shown (API doc 4). An unknown code is an unknown failure, never success. */
export const classifyCreateBankAccountError = (
  error: unknown,
): BankAccountErrorView => {
  if (error instanceof HbrNetworkError || error instanceof HbrResponseError)
    return { kind: "uncertain" }
  if (!(error instanceof HbrApiError)) return { kind: classifyBankError(error) }
  const body = refusalBodySchema.safeParse(error.body).data
  switch (error.code) {
    case "outcome_unknown":
      return { kind: "uncertain" }
    // Rule 10: only the 503 states "not sent"; a 502 claims nothing.
    case "bridge_unavailable":
    case "forwarder_unavailable":
      return error.status === 503
        ? { kind: "notSent" }
        : { kind: classifyBankError(error) }
    case "rail_unavailable":
      return { kind: "railUnavailable", gate: body?.gate ?? null }
    case "bank_account_exists":
    case "bank_account_revoked":
      // The server's fixed `detail` copy, shown as sent (API doc 4).
      return body?.detail
        ? { kind: "serverDetail", detail: body.detail }
        : { kind: "contactSupport" }
    case "customer_name_unavailable":
      return { kind: "nameUnavailable" }
    case "client_request_id_reused":
      return { kind: "idReused" }
    case "bank_account_deactivated":
    case "bank_account_conflict":
    case "bridge_response_mismatch":
      return { kind: "contactSupport" }
    case "bank_account_rejected":
      return { kind: "rejected" }
    case "bad_request":
      return { kind: "invalid" }
    case "customer_required":
    case "wallet_not_bound":
      return { kind: "notReady" }
    default:
      return { kind: classifyBankError(error) }
  }
}

export type RemoveBankAccountView =
  | "unconfirmed"
  | "removed"
  | "removing"
  | "inFlight"
  | "conflict"
  | "notFound"
  | BankErrorKind

/** The outcome of `DELETE /v1/bank-accounts/:id`. The list is re-read after every outcome. */
export const classifyRemoveBankAccount = (
  outcome: { status: string } | { error: unknown },
): RemoveBankAccountView => {
  if ("status" in outcome) {
    if (outcome.status === "deactivated") return "removed"
    if (outcome.status === "deactivation_pending") return "removing"
    return "unknown"
  }
  const { error } = outcome
  // No answer (network or timeout) to the DELETE: it may have been carried out.
  if (error instanceof HbrNetworkError) return "unconfirmed"
  if (error instanceof HbrApiError) {
    if (error.code === "ramp_in_flight") return "inFlight"
    if (error.status === 409 && error.code === "conflict") return "conflict"
    if (error.code === "bank_account_not_found") return "notFound"
  }
  return classifyBankError(error)
}
