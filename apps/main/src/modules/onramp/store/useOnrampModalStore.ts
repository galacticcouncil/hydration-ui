import { create } from "zustand"

export type OnrampFlow = "deposit" | "withdraw"

/** Opens the onchain deposit form on this source chain and asset. */
export type DepositPreset = {
  chainKey: string
  assetKey: string
}

type OnrampModalStore = {
  isOpen: boolean
  // kept after close so the content stays rendered during the exit animation
  flow: OnrampFlow | null
  depositPreset: DepositPreset | null
  open: (flow: OnrampFlow, depositPreset?: DepositPreset) => void
  close: () => void
  clearDepositPreset: () => void
}

export const useOnrampModalStore = create<OnrampModalStore>((set) => ({
  isOpen: false,
  flow: null,
  depositPreset: null,
  open: (flow, depositPreset) =>
    set({ isOpen: true, flow, depositPreset: depositPreset ?? null }),
  close: () => set({ isOpen: false }),
  clearDepositPreset: () => set({ depositPreset: null }),
}))
