import { create } from "zustand"

type PendingApproval = {
  chainKey: string
  txHash: string
  nonce: number
  to: string
}

type ApprovalTrackingStore = {
  pendingApprovals: PendingApproval[]
  addPendingApproval: (approval: PendingApproval) => void
  removePendingApproval: (chainKey: string, nonce: number) => void
  getPendingApprovals: (chainKey: string, nonce: number) => PendingApproval[]
}

export const useApprovalTrackingStore = create<ApprovalTrackingStore>(
  (set, get) => ({
    pendingApprovals: [],

    addPendingApproval: (approval) => {
      set((state) => ({
        pendingApprovals: [...state.pendingApprovals, approval],
      }))
    },

    removePendingApproval: (chainKey, nonce) => {
      set((state) => ({
        pendingApprovals: state.pendingApprovals.filter(
          (a) => chainKey !== a.chainKey && nonce !== a.nonce,
        ),
      }))
    },

    getPendingApprovals: (chainKey, nonce) => {
      return get().pendingApprovals.filter(
        (a) => a.chainKey === chainKey && a.nonce <= nonce,
      )
    },
  }),
)
