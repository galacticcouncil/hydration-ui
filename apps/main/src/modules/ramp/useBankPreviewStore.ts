import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { DepositCurrency, RailStatus } from "./deposit.mock"

export type BankSetupDraft = {
  currency: DepositCurrency
  amount: string
  accountType: string
  onboardingStep: number
  railStatus: Record<DepositCurrency, RailStatus>
  accounts: DepositCurrency[]
  providerHandoff: "idle" | "away" | "returned"
  screen: "onboarding" | "account" | "details"
}

type BankPreviewStore = {
  setups: Record<string, BankSetupDraft>
  saveSetup: (address: string, draft: BankSetupDraft) => void
}

// Preview setup only: never create history records or persist bank credentials.
// Replace these drafts with authenticated provider processes when the API is wired.
export const useBankPreviewStore = create<BankPreviewStore>()(
  persist(
    (set) => ({
      setups: {},
      saveSetup: (address, draft) =>
        set((state) => ({
          setups: { ...state.setups, [address]: draft },
        })),
    }),
    { name: "hydration-bank-setup-preview-v1", version: 1 },
  ),
)
