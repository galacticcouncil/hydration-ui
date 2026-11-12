import { describe, expect, it } from "vitest"

import { buildFixtureOnboarding } from "@/modules/onramp/bank/config/fixtures"
import { onboardingResponseSchema } from "@/modules/onramp/bank/config/schemas"
import {
  HbrApiError,
  HbrNetworkError,
} from "@/modules/onramp/bank/utils/hbrErrors"
import {
  classifyCreateCustomerError,
  deriveOnboardingStep,
  isRailOpen,
} from "@/modules/onramp/bank/utils/onboarding"

const read = (args: { status: string; gate: string; bound?: boolean }) =>
  onboardingResponseSchema.parse(
    buildFixtureOnboarding({
      type: "individual",
      bound: args.bound ?? true,
      status: args.status,
      gate: args.gate,
    }),
  )

describe("rail gating reads rails only", () => {
  it("an active stage with closed rails is not ready", () => {
    const step = deriveOnboardingStep({
      data: read({ status: "active", gate: "customer_not_active" }),
      error: null,
    })
    expect(step.kind).toBe("verify")
  })

  it("open rails are ready whatever the stage says", () => {
    const step = deriveOnboardingStep({
      data: read({ status: "tos_pending", gate: "ok" }),
      error: null,
    })
    expect(step).toEqual({ kind: "ready", rails: { usd: true, eur: true } })
  })

  it("offrampAvailable without gate ok reads closed", () => {
    expect(
      isRailOpen({ offrampAvailable: true, readable: true, gate: "drift" }),
    ).toBe(false)
    expect(
      isRailOpen({ offrampAvailable: false, readable: true, gate: "ok" }),
    ).toBe(false)
  })

  it("one open rail is enough, and says which", () => {
    const data = read({ status: "active", gate: "ok" })
    data.rails.eur = { offrampAvailable: false, readable: true, gate: "x" }
    expect(deriveOnboardingStep({ data, error: null })).toEqual({
      kind: "ready",
      rails: { usd: true, eur: false },
    })
  })
})

describe("onboarding step", () => {
  it("no customer yet asks for the account type", () => {
    const error = new HbrApiError(404, "customer_not_found")
    expect(deriveOnboardingStep({ data: undefined, error }).kind).toBe(
      "chooseType",
    )
  })

  it("an unbound customer asks for the wallet link, even with open rails", () => {
    const data = read({ status: "active", gate: "ok", bound: false })
    expect(deriveOnboardingStep({ data, error: null }).kind).toBe("bind")
  })

  it("an unknown stage shows the unknown copy and no ready screen", () => {
    const data = onboardingResponseSchema.parse({
      ...buildFixtureOnboarding({
        type: "individual",
        bound: true,
        status: "brand_new_stage",
        gate: "endorsement_absent",
      }),
    })
    expect(deriveOnboardingStep({ data, error: null })).toMatchObject({
      kind: "verify",
      stage: "unknown",
      view: "unknown",
    })
  })

  it("a failed latest read wins over older data", () => {
    const data = read({ status: "active", gate: "ok" })
    const error = new HbrApiError(502, "bridge_unavailable")
    expect(deriveOnboardingStep({ data, error })).toEqual({
      kind: "error",
      error: "unavailable",
    })
  })

  it("a 429 keeps the verification screen and never reads ready", () => {
    const data = read({ status: "active", gate: "ok" })
    const error = new HbrApiError(429, "rate_limited")
    expect(deriveOnboardingStep({ data, error })).toMatchObject({
      kind: "verify",
      rateLimited: true,
    })
  })

  it("a customer conflict is a support case", () => {
    const error = new HbrApiError(409, "customer_conflict")
    expect(deriveOnboardingStep({ data: undefined, error })).toEqual({
      kind: "error",
      error: "support",
    })
  })
})

describe("customer create errors never read failed", () => {
  it.each([
    [new HbrNetworkError(), "uncertain"],
    [new HbrApiError(502, "onboarding_uncertain"), "uncertain"],
    [new HbrApiError(503, "bridge_unavailable"), "notSentMayExist"],
    [new HbrApiError(503, "unavailable"), "notSent"],
    [new HbrApiError(409, "customer_type_conflict"), "typeConflict"],
    [new HbrApiError(409, "customer_create_needs_support"), "needsSupport"],
  ] as const)("%s -> %s", (error, kind) => {
    expect(classifyCreateCustomerError(error)).toBe(kind)
  })
})
