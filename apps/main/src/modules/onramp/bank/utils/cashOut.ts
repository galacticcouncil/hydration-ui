import type { PreparedEvmTransaction } from "@galacticcouncil/web3-connect/src/signers/EthereumSigner"
import z from "zod/v4"

import type {
  BankAccountView,
  RampBuildResponse,
  RampView,
} from "@/modules/onramp/bank/config/schemas"
import {
  HbrApiError,
  HbrNetworkError,
} from "@/modules/onramp/bank/utils/hbrErrors"
import type { HbrService } from "@/modules/onramp/bank/utils/hbrService"
import {
  BankErrorKind,
  classifyBankError,
} from "@/modules/onramp/bank/utils/onboarding"
import type { StrictSendState } from "@/modules/transactions/utils/strictEvm"

// ---- Refusals of POST /v1/ramps/quote and POST /v1/ramps ---------------

// Codes the user can act on, each with its own copy (API doc 4, "Builder
// refusal codes by status"). Any other code reads by its HTTP status.
const AMOUNT_CODES = [
  "invalid_amount",
  "below_floor",
  "amount_exceeds_max_redeemable",
  "amount_exceeds_vault_principal",
  "amount_exceeds_vault_payout_capacity",
  "insufficient_hollar_balance",
] as const
const ACCOUNT_CODES = [
  "la_not_found",
  "la_inactive",
  "external_account_inactive",
  "bank_account_removed",
  "bank_account_not_found",
] as const
const PAUSED_CODES = [
  "psm_redeem_paused",
  "vault_claims_paused",
  "vault_payout_closed",
  "route_refused",
] as const

export type CashOutErrorView =
  /** 503 ramp_build_unavailable: permanent for this server, no try-again (rule 16). */
  | { kind: "notAvailable" }
  /** 409 ramp_pending: show that ramp; nothing was built. */
  | { kind: "pending"; rampId: string | null; validUntil: string | null }
  /** A ramp may have been recorded (rampRecorded "unknown", or no answer to the build). */
  | { kind: "recordUnknown" }
  | { kind: (typeof AMOUNT_CODES)[number] }
  | { kind: "account" | "paused" | "notReady" | "offrampUnavailable" }
  /** Any other 503 or 500: could not prepare; a new Confirm is a new build. */
  | { kind: "couldNotPrepare" }
  | { kind: BankErrorKind }

const refusalBodySchema = z.object({
  ramp: z.object({ id: z.string() }).nullable().optional(),
  validUntil: z.string().nullable().optional(),
  rampRecorded: z.string().optional(),
})

/**
 * How a refused quote or build is shown. A build with no answer (network or
 * timeout) is `recordUnknown`, never "nothing recorded": the server may have
 * recorded the ramp, and the next Confirm answers 409 ramp_pending with it.
 */
export const classifyCashOutError = (
  error: unknown,
  route: "quote" | "build",
): CashOutErrorView => {
  if (error instanceof HbrNetworkError)
    return route === "build"
      ? { kind: "recordUnknown" }
      : { kind: "unavailable" }
  if (!(error instanceof HbrApiError)) return { kind: classifyBankError(error) }
  const body = refusalBodySchema.safeParse(error.body).data
  if (error.code === "ramp_build_unavailable") return { kind: "notAvailable" }
  if (error.code === "ramp_pending")
    return {
      kind: "pending",
      rampId: body?.ramp?.id ?? null,
      validUntil: body?.validUntil ?? null,
    }
  if (body?.rampRecorded === "unknown") return { kind: "recordUnknown" }
  const code = error.code
  if ((AMOUNT_CODES as readonly string[]).includes(code))
    return { kind: code as (typeof AMOUNT_CODES)[number] }
  if ((ACCOUNT_CODES as readonly string[]).includes(code))
    return { kind: "account" }
  if ((PAUSED_CODES as readonly string[]).includes(code))
    return { kind: "paused" }
  if (code === "customer_required" || code === "wallet_not_bound")
    return { kind: "notReady" }
  if (code === "customer_offramp_unavailable")
    return { kind: "offrampUnavailable" }
  if (
    error.status === 401 ||
    error.status === 429 ||
    code === "customer_conflict" ||
    code === "customer_link_missing"
  )
    return { kind: classifyBankError(error) }
  if (error.status === 500 || error.status === 503)
    return { kind: "couldNotPrepare" }
  return { kind: "unknown" }
}

// ---- Bank accounts a cash-out can go to --------------------------------

/** Accounts offered for a cash-out: active, with a known currency. */
export const getCashOutAccounts = (accounts: BankAccountView[]) =>
  accounts.filter(
    (a) =>
      a.status === "active" && (a.currency === "usd" || a.currency === "eur"),
  )

// ---- Payout limit ------------------------------------------------------

export type PayoutLimitView =
  | { kind: "none" }
  | { kind: "wait"; minMinutes: number | null }

/**
 * `refillNeeded: false` promises no payout time, so nothing is said.
 * `minRefillSeconds` is a LOWER bound, shown as "at least", rounded up.
 */
export const getPayoutLimitView = (limit: {
  refillNeeded: boolean
  minRefillSeconds: string | null
}): PayoutLimitView => {
  if (!limit.refillNeeded) return { kind: "none" }
  if (limit.minRefillSeconds === null) return { kind: "wait", minMinutes: null }
  return {
    kind: "wait",
    minMinutes: Math.max(1, Math.ceil(Number(limit.minRefillSeconds) / 60)),
  }
}

// ---- Off-ramp timeline (API doc 5.5) -----------------------------------

export const RAMP_STAGES = [
  "Prepared",
  "On Hydration",
  "On Base",
  "At Bridge",
  "Paid",
] as const
export type RampStage = (typeof RAMP_STAGES)[number]

// API doc 5.5, the stage table. A status not listed here (a later server
// version, or "unknown") shows no timeline progress (rule 13).
const STAGE_OF: Record<string, RampStage> = {
  built: "Prepared",
  submitted: "Prepared",
  uncertain: "Prepared",
  built_past_deadline: "Prepared",
  unlinked_redeem: "Prepared",
  unlinked_redeem_unreadable: "Prepared",
  burn_observed: "On Hydration",
  late_burn_checking: "On Hydration",
  fee_limit_checking: "On Hydration",
  credited: "On Base",
  payout_observed: "At Bridge",
  attribution_ambiguous: "At Bridge",
  bridge_unknown: "At Bridge",
  bridge_awaiting_funds: "At Bridge",
  bridge_in_review: "At Bridge",
  bridge_funds_received: "At Bridge",
  bridge_payment_submitted: "At Bridge",
  paid: "Paid",
}

/** How many timeline stages are lit (0 = off-timeline: no progress shown). */
export const getLitStages = (status: string): number => {
  const stage = Object.prototype.hasOwnProperty.call(STAGE_OF, status)
    ? STAGE_OF[status]
    : undefined
  return stage ? RAMP_STAGES.indexOf(stage) + 1 : 0
}

// ---- What this tab did with a prepared cash-out ------------------------

export type CashOutSendRecord = {
  approveDigest: string | null
  redeemDigest: string
}

/**
 * - none: not handed to the wallet in this tab
 * - checking: the redeem reached the wallet and the outcome was not a 4001
 *   with no hash (the wallet may have sent it): "Checking - do not send again"
 * - declined: the user declined in the wallet (4001, no hash); nothing sent
 * - notSent: the redeem never reached the wallet's send (refused before it,
 *   or never presented)
 * - approvalReverted: the approval's receipt was OBSERVED reverted, so the
 *   redeem was never presented
 * - approvalChecking: the approval reached the wallet and its outcome was not
 *   observed (no answer, an error, a hash without a receipt, a cancel): it reads
 *   Checking; the redeem was never presented
 */
export type LocalSendView =
  | "none"
  | "checking"
  | "declined"
  | "notSent"
  | "approvalReverted"
  | "approvalChecking"

export const getLocalSendView = (
  approve: StrictSendState | undefined,
  redeem: StrictSendState | undefined,
  handedOver: boolean,
): LocalSendView => {
  if (!handedOver) return "none"
  if (redeem !== undefined) {
    if (redeem === "rejected") return "declined"
    if (redeem === "refused") return "notSent"
    return "checking"
  }
  switch (approve) {
    case "rejected":
      return "declined"
    case undefined:
    case "refused":
    case "succeeded":
      return "notSent"
    case "reverted":
      return "approvalReverted"
    // claimed, prompted, failed, sent, unknown: not observed
    default:
      return "approvalChecking"
  }
}

/**
 * Rule 11: the one place the screen shows its own label. While the server
 * still says `built`, a redeem the wallet may have sent reads "Checking - do
 * not send again" instead of "Prepared"; any other status is the server's.
 */
export const showsLocalChecking = (
  view: Pick<RampView, "status">,
  local: LocalSendView,
) => local === "checking" && view.status === "built"

// ---- The hand-over to the wallet ---------------------------------------

export type PreparedCashOut = {
  rampId: string
  validUntil: string
  approveTx: PreparedEvmTransaction | null
  redeemTx: PreparedEvmTransaction
}

export const toPreparedCashOut = (res: RampBuildResponse): PreparedCashOut => ({
  rampId: res.ramp.id,
  validUntil: res.validUntil,
  approveTx: res.approveTx,
  redeemTx: res.redeemTx,
})

// ---- Report of the redeem hash ------------------------------------------

export const REPORT_RETRY_DELAYS_MS = [5_000, 15_000] as const

/**
 * POST /v1/ramps/:id/report with the REDEEM hash. Advisory and idempotent
 * (the same hash answers 200 again), so a failure with no answer, a 5xx or a
 * 429 is repeated with the same hash a bounded number of times; a 4xx other
 * than 429 is final. Called only with a hash whose receipt is mined
 * (strict `onMined`), never from the wallet's answer alone. Not tied to a
 * screen: a late hash is reported once it mines.
 */
export const reportRedeemHash = async (args: {
  service: HbrService
  h160: string
  rampId: string
  txHash: string
  sleep?: (ms: number) => Promise<void>
}): Promise<"reported" | "refused" | "notReported"> => {
  const sleep =
    args.sleep ??
    ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)))
  for (let attempt = 0; ; attempt++) {
    try {
      await args.service
        .forWallet(args.h160)
        .reportRamp(args.rampId, args.txHash)
      return "reported"
    } catch (error) {
      const repeatable =
        error instanceof HbrNetworkError ||
        (error instanceof HbrApiError &&
          (error.status === 429 || error.status >= 500))
      if (!repeatable) return "refused"
      const delay = REPORT_RETRY_DELAYS_MS[attempt]
      if (delay === undefined) return "notReported"
      await sleep(delay)
    }
  }
}
