import { hoursToMilliseconds } from "date-fns"
import { firstBy } from "remeda"
import { create } from "zustand"
import { persist } from "zustand/middleware"

// Covers the wait for the first block and a skewed browser clock, while an
// entry whose transfer never arrived can't take one sent much later
const MATCH_WINDOW_MS = hoursToMilliseconds(1)

/** A zcash withdrawal sent to NEAR, waiting for its claim there. */
export type ZecWithdrawal = {
  /** The transfer to NEAR, whose failure drops the entry. */
  txHash: string
  /** NEAR account the ZEC is sent to and claimed on. */
  nearAccount: string
  /** Zatoshi. */
  amount: string
  /** Zcash transparent address. */
  recipient: string
  /** When the transfer to NEAR was submitted, in ms. */
  submittedAt: number
}

type ZecWithdrawalsStore = {
  withdrawals: ZecWithdrawal[]
  addWithdrawal: (withdrawal: ZecWithdrawal) => void
  findWithdrawal: (
    nearAccount: string,
    amount: string,
    sentAt: number,
  ) => ZecWithdrawal | undefined
  removeWithdrawal: (txHash: string) => void
}

/**
 * The withdrawal a claim on NEAR completes: the same account and amount,
 * submitted closest to when the journey was sent.
 *
 * xc-scan lists an ntt journey under a tx hash the app never saw, so it is
 * matched the way `findWormholeTwin` matches one to its placeholder.
 */
export const findZecWithdrawal = (
  withdrawals: ZecWithdrawal[],
  nearAccount: string,
  amount: string,
  sentAt: number,
): ZecWithdrawal | undefined => {
  const distance = (w: ZecWithdrawal) => Math.abs(sentAt - w.submittedAt)

  return firstBy(
    withdrawals.filter(
      (w) =>
        w.nearAccount === nearAccount &&
        w.amount === amount &&
        distance(w) <= MATCH_WINDOW_MS,
    ),
    distance,
  )
}

export const useZecWithdrawalsStore = create<ZecWithdrawalsStore>()(
  persist(
    (set, get) => ({
      withdrawals: [],
      addWithdrawal: (withdrawal) =>
        set({ withdrawals: [...get().withdrawals, withdrawal] }),
      findWithdrawal: (nearAccount, amount, sentAt) =>
        findZecWithdrawal(get().withdrawals, nearAccount, amount, sentAt),
      removeWithdrawal: (txHash) =>
        set({
          withdrawals: get().withdrawals.filter((w) => w.txHash !== txHash),
        }),
    }),
    { name: "zec-withdrawals", version: 1 },
  ),
)
