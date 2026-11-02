import type { BankSetupDraft } from "./useBankPreviewStore"

export type BankSetupSession = { startedAt: number; lastActiveAt: number }

export const isBankSetupSessionValid = (
  session: BankSetupSession | undefined,
  now = Date.now(),
) =>
  !!session &&
  now >= session.startedAt &&
  now - session.startedAt < 12 * 60 * 60 * 1000 &&
  now - session.lastActiveAt < 30 * 60 * 1000

export const getBankSetupEntryScreen = (
  intent: "deposit" | "withdraw",
  saved: BankSetupDraft | undefined,
  now = Date.now(),
): BankSetupDraft["screen"] => {
  if (intent === "withdraw") {
    return saved &&
      isBankSetupSessionValid(saved.session, now) &&
      saved.onboardingStep >= 5 &&
      saved.railStatus[saved.currency] === "available"
      ? "entry"
      : "onboarding"
  }
  return saved?.intent === "withdraw" ? "entry" : (saved?.screen ?? "entry")
}
