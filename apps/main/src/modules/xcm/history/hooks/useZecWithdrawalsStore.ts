import { create } from "zustand"
import { persist } from "zustand/middleware"

import { toNearUniversal } from "@/modules/xcm/history/utils/nearNtt"

/**
 * A zcash withdrawal sent to a 1Click deposit address on NEAR, waiting for
 * its claim there: claimed into the address, it goes on to Zcash.
 */
export type ZecWithdrawal = {
  /** The transfer to NEAR, whose failure drops the entry. */
  txHash: string
  /** NEAR account 1Click pays out from, to the recipient. */
  depositAddress: string
  /** Zcash transparent address. */
  recipient: string
  /** ISO timestamp the deposit address stops accepting the claim's ZEC. */
  deadline: string
}

type ZecWithdrawalsStore = {
  withdrawals: ZecWithdrawal[]
  addWithdrawal: (withdrawal: ZecWithdrawal) => void
  /**
   * The withdrawal a vaa pays: the vaa names the deposit address by its hash
   * only, which the claim then passes in plain.
   */
  findWithdrawal: (payee: string) => ZecWithdrawal | undefined
  removeWithdrawal: (txHash: string) => void
}

export const useZecWithdrawalsStore = create<ZecWithdrawalsStore>()(
  persist(
    (set, get) => ({
      withdrawals: [],
      addWithdrawal: (withdrawal) =>
        set({ withdrawals: [...get().withdrawals, withdrawal] }),
      findWithdrawal: (payee) =>
        get().withdrawals.find(
          (w) => toNearUniversal(w.depositAddress) === payee,
        ),
      removeWithdrawal: (txHash) =>
        set({
          withdrawals: get().withdrawals.filter((w) => w.txHash !== txHash),
        }),
    }),
    {
      name: "zec-withdrawals",
      version: 2,
      // v1 withdrawals paid the user's own NEAR account, where a claim leaves
      // the ZEC with them
      migrate: () => ({ withdrawals: [] }),
    },
  ),
)
