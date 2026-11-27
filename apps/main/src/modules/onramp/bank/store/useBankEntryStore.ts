import { create } from "zustand"

import type { OnrampCurrency } from "@/modules/onramp/bank/config/schemas"

/**
 * Where Portfolio, Deposits reopens a bank flow (Figma R01, M01-M08): the
 * direction and, optionally, the item to show. Memory only and taken once by
 * the flow it opens; it holds no bank detail, amount or status (those are
 * read live by the screen it opens).
 */
export type BankEntry = {
  direction: "deposit" | "withdraw"
  target?:
    | { kind: "bankDetails"; currency: OnrampCurrency }
    | { kind: "deposit"; id: string }
    | { kind: "ramp"; id: string }
}

type BankEntryStore = {
  entry: BankEntry | null
  open: (entry: BankEntry) => void
  clear: () => void
}

export const useBankEntryStore = create<BankEntryStore>((set) => ({
  entry: null,
  open: (entry) => set({ entry }),
  clear: () => set({ entry: null }),
}))
