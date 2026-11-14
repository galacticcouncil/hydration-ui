import type {
  OnrampAccountsResponse,
  OnrampAccountView,
  OnrampCurrency,
} from "@/modules/onramp/bank/config/schemas"
import {
  classifyBankError,
  type OnboardingStep,
} from "@/modules/onramp/bank/utils/onboarding"
import { isRateLimited } from "@/modules/onramp/bank/utils/onramp"

/**
 * The "Bank setup" tiles on Portfolio, Deposits (Figma M01-M08, R02), derived
 * from whether a session exists and from the LATEST onboarding and on-ramp
 * reads, success or failure. React Query keeps the last good data after a
 * failed refetch; a tile never shows it: a 429 on the latest read is the
 * neutral "checking again" tile, any other failure is the error tile, and
 * neither falls back to a positive state. Nothing is stored. Onboarding
 * stages and account statuses carry no server label, so the copy is ours per
 * code (as on the set-up screens), and an unknown code reads as checking.
 */
export type BankTileKind =
  | "connect"
  | "signIn"
  | "loading"
  | "error"
  | "chooseType"
  | "bind"
  | "verifyAction"
  | "review"
  | "notAvailableYet"
  | "rejected"
  | "paused"
  | "verifyUnknown"
  | "setUp"
  | "account"
  | "rechecking"

export type BankTileTone = "attention" | "pending" | "success" | "neutral"

export type BankTile = {
  kind: BankTileKind
  tone: BankTileTone
  /** The on-ramp account a `kind: "account"` tile is about. */
  account?: {
    currency: OnrampCurrency
    status: OnrampAccountView["status"]
  }
}

const ACCOUNT_TONE: Record<string, BankTileTone> = {
  ready: "success",
  preparing: "pending",
  checking: "pending",
  waiting_rail: "attention",
  refused: "attention",
  needs_attention: "attention",
}

export const deriveBankTiles = (input: {
  walletOk: boolean
  hasSession: boolean
  step: OnboardingStep | null
  onramp: OnrampAccountsResponse | undefined
  /** The latest on-ramp read's error, if it failed (its data may be older). */
  onrampError?: unknown
}): BankTile[] => {
  const { walletOk, hasSession, step, onramp, onrampError } = input
  if (!walletOk) return [{ kind: "connect", tone: "attention" }]
  if (!hasSession || !step) return [{ kind: "signIn", tone: "attention" }]

  switch (step.kind) {
    case "loading":
      return [{ kind: "loading", tone: "neutral" }]
    case "error":
      if (step.error === "rateLimited")
        return [{ kind: "rechecking", tone: "neutral" }]
      return [
        {
          kind: step.error === "signedOut" ? "signIn" : "error",
          tone: "attention",
        },
      ]
    case "chooseType":
      return [{ kind: "chooseType", tone: "attention" }]
    case "bind":
      return [{ kind: "bind", tone: "attention" }]
    case "verify":
      // A 429 after a good read keeps the verify step on the set-up screen;
      // here its older stage is not restated.
      if (step.rateLimited) return [{ kind: "rechecking", tone: "neutral" }]
      switch (step.view) {
        case "action":
          return [{ kind: "verifyAction", tone: "attention" }]
        case "review":
          return [{ kind: "review", tone: "pending" }]
        case "notAvailableYet":
          return [{ kind: "notAvailableYet", tone: "pending" }]
        case "rejected":
          return [{ kind: "rejected", tone: "attention" }]
        case "paused":
          return [{ kind: "paused", tone: "attention" }]
        default:
          return [{ kind: "verifyUnknown", tone: "neutral" }]
      }
    case "ready":
      break
  }

  if (onrampError !== undefined && onrampError !== null) {
    if (isRateLimited(onrampError))
      return [{ kind: "rechecking", tone: "neutral" }]
    if (classifyBankError(onrampError) === "signedOut")
      return [{ kind: "signIn", tone: "attention" }]
    return [{ kind: "error", tone: "attention" }]
  }

  // Ready: one tile per currency whose on-ramp account was requested; with
  // none (or no answer yet), one tile that the set-up is done.
  // An unknown status (schema fail-closed) reads as checking, never ready.
  const tiles: BankTile[] = []
  for (const a of onramp?.accounts ?? []) {
    if (a.status === "not_requested") continue
    if (a.currency !== "usd" && a.currency !== "eur") continue
    tiles.push({
      kind: "account",
      tone: ACCOUNT_TONE[a.status] ?? "neutral",
      account: { currency: a.currency, status: a.status },
    })
  }
  return tiles.length > 0 ? tiles : [{ kind: "setUp", tone: "success" }]
}
