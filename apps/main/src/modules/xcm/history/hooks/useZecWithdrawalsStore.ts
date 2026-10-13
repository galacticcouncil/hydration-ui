import Big from "big.js"
import { create } from "zustand"
import { persist } from "zustand/middleware"

/** A zcash withdrawal sent to NEAR, waiting for its claim there. */
export type ZecWithdrawal = {
  nearAccount: string
  /** ZEC, decimal. */
  amount: string
  /** Zcash transparent address. */
  recipient: string
}

type ZecWithdrawalsStore = {
  withdrawals: ZecWithdrawal[]
  addWithdrawal: (withdrawal: ZecWithdrawal) => void
  findWithdrawal: (
    nearAccount: string,
    amount: string,
  ) => ZecWithdrawal | undefined
  removeWithdrawal: (withdrawal: ZecWithdrawal) => void
}

export const useZecWithdrawalsStore = create<ZecWithdrawalsStore>()(
  persist(
    (set, get) => ({
      withdrawals: [],
      addWithdrawal: (withdrawal) =>
        set({ withdrawals: [...get().withdrawals, withdrawal] }),
      findWithdrawal: (nearAccount, amount) =>
        get().withdrawals.find(
          (w) => w.nearAccount === nearAccount && Big(w.amount).eq(amount),
        ),
      removeWithdrawal: (withdrawal) =>
        set({
          withdrawals: get().withdrawals.filter((w) => w !== withdrawal),
        }),
    }),
    { name: "zec-withdrawals", version: 1 },
  ),
)
