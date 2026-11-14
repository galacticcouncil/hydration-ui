import type {
  OnboardingResponse,
  OnboardingStage,
} from "@/modules/onramp/bank/config/schemas"
import {
  HbrApiError,
  HbrNetworkError,
} from "@/modules/onramp/bank/utils/hbrErrors"

type Rail = OnboardingResponse["rails"]["usd"]
type Link = OnboardingResponse["links"]["kyc"]

/**
 * Whether the off-ramp rail can be used: `rails` ONLY (API doc 2 step 5),
 * never the onboarding `status`. The server sets `offrampAvailable` true only
 * when its gate is `ok`; both are required here, so a contradicting answer
 * reads closed.
 */
export const isRailOpen = (rail: Rail): boolean =>
  rail.offrampAvailable === true && rail.gate === "ok"

export const getOpenRails = (rails: OnboardingResponse["rails"]) => ({
  usd: isRailOpen(rails.usd),
  eur: isRailOpen(rails.eur),
})

/** What the verification screen says for a stage; it never opens a rail. */
export type StageView =
  | "action"
  | "review"
  | "notAvailableYet"
  | "rejected"
  | "paused"
  | "unknown"

export const getStageView = (stage: OnboardingStage): StageView => {
  switch (stage) {
    case "tos_pending":
    case "kyc_not_started":
    case "kyc_incomplete":
      return "action"
    case "kyc_under_review":
    case "endorsement_pending":
      return "review"
    case "active":
      return "notAvailableYet"
    case "kyc_rejected":
      return "rejected"
    case "customer_paused":
      return "paused"
    default:
      return "unknown"
  }
}

/** How a failed call is shown. A read may be repeated; nothing here is "failed". */
export type BankErrorKind =
  | "signedOut"
  | "support"
  | "rateLimited"
  | "unavailable"
  | "unknown"

export const classifyBankError = (error: unknown): BankErrorKind => {
  if (error instanceof HbrNetworkError) return "unavailable"
  if (!(error instanceof HbrApiError)) return "unknown"
  if (error.status === 401) return "signedOut"
  if (error.status === 429) return "rateLimited"
  if (
    error.code === "customer_conflict" ||
    error.code === "customer_link_missing"
  )
    return "support"
  if (error.status === 502 || error.status === 503) return "unavailable"
  return "unknown"
}

export type OnboardingStep =
  | { kind: "loading" }
  | { kind: "error"; error: BankErrorKind }
  | { kind: "chooseType" }
  | { kind: "bind" }
  | {
      kind: "verify"
      stage: OnboardingStage
      view: StageView
      links: { kyc: Link; tos: Link }
      rateLimited: boolean
    }
  | { kind: "ready"; rails: { usd: boolean; eur: boolean } }

/**
 * The onboarding screen, derived from the latest onboarding read only (API doc
 * 2: "the UI decides what to show from the response, never from what it did
 * last"). A failed latest read wins over older data, except a 429 on the
 * verification screen, which keeps the screen and backs off.
 */
export const deriveOnboardingStep = (query: {
  data: OnboardingResponse | undefined
  error: unknown
}): OnboardingStep => {
  const { data, error } = query
  if (error && error instanceof HbrApiError) {
    if (error.status === 404 && error.code === "customer_not_found")
      return { kind: "chooseType" }
  }
  const rateLimited = classifyBankError(error) === "rateLimited"
  if (error && !(rateLimited && data)) {
    return { kind: "error", error: classifyBankError(error) }
  }
  if (!data) return { kind: "loading" }
  if (!data.bound) return { kind: "bind" }

  const rails = getOpenRails(data.rails)
  if (!rateLimited && (rails.usd || rails.eur)) return { kind: "ready", rails }

  return {
    kind: "verify",
    stage: data.status,
    view: getStageView(data.status),
    links: data.links,
    rateLimited,
  }
}

/**
 * How a failed `POST /v1/customers` is shown (API doc 4). None reads
 * "failed": `uncertain` and `notSentMayExist` may already have created the
 * customer, and repeating the same create converges on it.
 */
export type CreateCustomerErrorKind =
  | "typeConflict"
  | "needsSupport"
  | "uncertain"
  | "notSentMayExist"
  | "notSent"
  | BankErrorKind

export const classifyCreateCustomerError = (
  error: unknown,
): CreateCustomerErrorKind => {
  if (error instanceof HbrNetworkError) return "uncertain"
  if (error instanceof HbrApiError) {
    if (error.code === "customer_type_conflict") return "typeConflict"
    if (error.code === "customer_create_needs_support") return "needsSupport"
    if (error.code === "onboarding_uncertain") return "uncertain"
    if (error.status === 503 && error.code === "bridge_unavailable")
      return "notSentMayExist"
    if (error.status === 503 && error.code === "unavailable") return "notSent"
  }
  return classifyBankError(error)
}
