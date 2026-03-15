import { create } from "zustand"
import { persist } from "zustand/middleware"

export type XcmBridgeTxEntry = {
  bridgeProvider: string
  /** Intended destination chain URN (may differ from xc-scan's tracked destination) */
  destUrn?: string
}

type XcmBridgeTxStore = {
  /** Maps originTxPrimary (txHash on source chain) → entry */
  entries: Record<string, XcmBridgeTxEntry>
  addEntry: (txHash: string, entry: XcmBridgeTxEntry) => void
}

export const useXcmBridgeTxStore = create<XcmBridgeTxStore>()(
  persist(
    (set) => ({
      entries: {},
      addEntry: (txHash, entry) =>
        set((state) => ({
          entries: { ...state.entries, [txHash]: entry },
        })),
    }),
    { name: "xcm-bridge-tx-store", version: 2 },
  ),
)
