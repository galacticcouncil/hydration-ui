import { create } from "zustand"

import type { CashOutSendRecord } from "@/modules/onramp/bank/utils/cashOut"

export type CashOutRecord = CashOutSendRecord & {
  /** The redeem hash the wallet returned, if any (never the approve's). */
  redeemHash: string | null
  report: "pending" | "reported" | "refused" | "notReported" | null
}

type BankCashOutStore = {
  /** Keyed `${h160}:${rampId}`. */
  records: Record<string, CashOutRecord>
  record: (h160: string, rampId: string, send: CashOutSendRecord) => void
  update: (h160: string, rampId: string, patch: Partial<CashOutRecord>) => void
}

export const cashOutKey = (h160: string, rampId: string) =>
  `${h160.toLowerCase()}:${rampId}`

/**
 * What this tab handed to the wallet per cash-out: ledger digests and the
 * redeem hash, never a transaction. Memory only (no persist, no sync), so the
 * local "Checking" state lasts for this tab; after a reload the server's
 * label shows.
 */
export const useBankCashOutStore = create<BankCashOutStore>((set) => ({
  records: {},
  record: (h160, rampId, send) =>
    set((state) => ({
      records: {
        ...state.records,
        [cashOutKey(h160, rampId)]: { ...send, redeemHash: null, report: null },
      },
    })),
  update: (h160, rampId, patch) =>
    set((state) => {
      const key = cashOutKey(h160, rampId)
      const current = state.records[key]
      if (!current) return state
      return { records: { ...state.records, [key]: { ...current, ...patch } } }
    }),
}))
