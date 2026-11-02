import { describe, expect, it } from "vitest"

import {
  getBankSetupEntryScreen,
  isBankSetupSessionValid,
} from "./BankSetupSession.utils"
import type { BankSetupDraft } from "./useBankPreviewStore"
const now = 100_000_000
const saved: BankSetupDraft = {
  intent: "deposit",
  session: { startedAt: now, lastActiveAt: now },
  currency: "USD",
  amount: "500",
  accountType: "Individual",
  onboardingStep: 5,
  railStatus: { USD: "available", EUR: "in review" },
  accounts: ["USD"],
  providerHandoff: "returned",
  screen: "details",
}
describe("shared mock bank setup", () => {
  it("bypasses setup for an approved depositor opening withdrawal", () => {
    expect(getBankSetupEntryScreen("withdraw", saved, now)).toBe("entry")
  })
  it("does not treat a wallet or old draft alone as authentication", () => {
    expect(getBankSetupEntryScreen("withdraw", undefined, now)).toBe(
      "onboarding",
    )
    expect(
      getBankSetupEntryScreen(
        "withdraw",
        { ...saved, session: undefined },
        now,
      ),
    ).toBe("onboarding")
  })
  it("checks the selected currency, including revoked approval", () => {
    expect(
      getBankSetupEntryScreen("withdraw", { ...saved, currency: "EUR" }, now),
    ).toBe("onboarding")
    expect(
      getBankSetupEntryScreen(
        "withdraw",
        { ...saved, railStatus: { ...saved.railStatus, USD: "rejected" } },
        now,
      ),
    ).toBe("onboarding")
  })
  it("expires at idle and absolute limits", () => {
    expect(isBankSetupSessionValid(saved.session, now + 30 * 60_000 - 1)).toBe(
      true,
    )
    expect(isBankSetupSessionValid(saved.session, now + 30 * 60_000)).toBe(
      false,
    )
    expect(
      isBankSetupSessionValid(
        { startedAt: now - 12 * 60 * 60_000, lastActiveAt: now },
        now,
      ),
    ).toBe(false)
  })
  it("does not resume withdrawal setup into a deposit-account screen", () => {
    expect(
      getBankSetupEntryScreen(
        "deposit",
        { ...saved, intent: "withdraw", screen: "onboarding" },
        now,
      ),
    ).toBe("entry")
    expect(getBankSetupEntryScreen("deposit", saved, now)).toBe("details")
  })
})
