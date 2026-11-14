import { describe, expect, it } from "vitest"

import onrampCopy from "@/i18n/locales/en/onramp.json"
import {
  BankTileKind,
  deriveBankTiles,
} from "@/modules/onramp/bank/utils/bankTile"
import {
  HbrApiError,
  HbrNetworkError,
} from "@/modules/onramp/bank/utils/hbrErrors"
import type { OnboardingStep } from "@/modules/onramp/bank/utils/onboarding"

const link = { url: null, readable: false }
const verify = (view: string): OnboardingStep =>
  ({
    kind: "verify",
    stage: "x",
    view,
    links: { kyc: link, tos: link },
    rateLimited: false,
  }) as unknown as OnboardingStep
const ready: OnboardingStep = {
  kind: "ready",
  rails: { usd: true, eur: false },
}
const account = (currency: string, status: string) =>
  ({
    currency,
    status,
    onrampAvailable: false,
    retryAllowed: false,
    instructions: null,
    minimumDeposit: null,
  }) as never

describe("deriveBankTiles", () => {
  it("no EVM wallet, then no session, come before any read", () => {
    expect(
      deriveBankTiles({
        walletOk: false,
        hasSession: true,
        step: ready,
        onramp: undefined,
      }),
    ).toEqual([{ kind: "connect", tone: "attention" }])
    expect(
      deriveBankTiles({
        walletOk: true,
        hasSession: false,
        step: ready,
        onramp: undefined,
      }),
    ).toEqual([{ kind: "signIn", tone: "attention" }])
  })

  it("a 401 on the read is the sign-in tile, never a stale state", () => {
    expect(
      deriveBankTiles({
        walletOk: true,
        hasSession: true,
        step: { kind: "error", error: "signedOut" },
        onramp: undefined,
      })[0]!.kind,
    ).toBe("signIn")
  })

  it.each([
    ["action", "verifyAction"],
    ["review", "review"],
    ["notAvailableYet", "notAvailableYet"],
    ["rejected", "rejected"],
    ["paused", "paused"],
    ["unknown", "verifyUnknown"],
    ["a-later-view", "verifyUnknown"],
  ])("verify view %s reads %s", (view, kind) => {
    expect(
      deriveBankTiles({
        walletOk: true,
        hasSession: true,
        step: verify(view),
        onramp: undefined,
      })[0]!.kind,
    ).toBe(kind)
  })

  it("ready: a tile per requested currency; none requested reads set up", () => {
    expect(
      deriveBankTiles({
        walletOk: true,
        hasSession: true,
        step: ready,
        onramp: {
          accounts: [
            account("usd", "not_requested"),
            account("eur", "not_requested"),
          ],
        },
      }),
    ).toEqual([{ kind: "setUp", tone: "success" }])
    const tiles = deriveBankTiles({
      walletOk: true,
      hasSession: true,
      step: ready,
      onramp: {
        accounts: [account("usd", "checking"), account("eur", "refused")],
      },
    })
    expect(
      tiles.map((t) => [t.account?.currency, t.account?.status, t.tone]),
    ).toEqual([
      ["usd", "checking", "pending"],
      ["eur", "refused", "attention"],
    ])
  })

  it("an unknown account status is checking copy and a neutral tone, never ready", () => {
    const [tile] = deriveBankTiles({
      walletOk: true,
      hasSession: true,
      step: ready,
      onramp: { accounts: [account("usd", "unknown")] },
    })
    expect(tile).toEqual({
      kind: "account",
      tone: "neutral",
      account: { currency: "usd", status: "unknown" },
    })
  })

  // BankSetupTile builds its keys from the kind (and status): each must exist.
  it("every tile has its four strings", () => {
    const copy = onrampCopy as unknown as Record<string, string>
    const kinds: BankTileKind[] = [
      "connect",
      "signIn",
      "error",
      "chooseType",
      "bind",
      "verifyAction",
      "review",
      "notAvailableYet",
      "rejected",
      "paused",
      "verifyUnknown",
      "setUp",
      "rechecking",
    ]
    const prefixes = [
      ...kinds.map((k) => `bank.tile.${k}`),
      ...[
        "ready",
        "preparing",
        "checking",
        "waiting_rail",
        "refused",
        "needs_attention",
        "unknown",
      ].map((s) => `bank.tile.account.${s}`),
    ]
    const missing = prefixes.flatMap((p) =>
      ["pill", "title", "description", "cta"]
        .map((f) => `${p}.${f}`)
        .filter((k) => !copy[k]),
    )
    expect(missing).toEqual([])
  })

  // Review 4a B2: the latest read's failure wins over older data.
  it("a failed on-ramp read never yields an account or set-up tile", () => {
    const base = {
      walletOk: true,
      hasSession: true,
      step: ready,
      onramp: { accounts: [account("usd", "ready")] },
    }
    const http = (status: number) =>
      new HbrApiError(status, status === 429 ? "rate_limited" : "internal")
    expect(deriveBankTiles({ ...base, onrampError: http(429) })).toEqual([
      { kind: "rechecking", tone: "neutral" },
    ])
    expect(deriveBankTiles({ ...base, onrampError: http(500) })).toEqual([
      { kind: "error", tone: "attention" },
    ])
    expect(
      deriveBankTiles({ ...base, onrampError: new HbrNetworkError() }),
    ).toEqual([{ kind: "error", tone: "attention" }])
    expect(deriveBankTiles({ ...base, onrampError: http(401) })).toEqual([
      { kind: "signIn", tone: "attention" },
    ])
  })

  it("a 429 on the onboarding read restates no older stage", () => {
    const limited = { ...(verify("review") as object), rateLimited: true }
    expect(
      deriveBankTiles({
        walletOk: true,
        hasSession: true,
        step: limited as OnboardingStep,
        onramp: undefined,
      }),
    ).toEqual([{ kind: "rechecking", tone: "neutral" }])
  })
})
