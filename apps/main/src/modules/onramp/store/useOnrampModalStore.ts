import { create } from "zustand"

export type OnrampFlow = "deposit" | "withdraw"

type OnrampModalStore = {
  isOpen: boolean
  // kept after close so the content stays rendered during the exit animation
  flow: OnrampFlow | null
  open: (flow: OnrampFlow) => void
  close: () => void
}

export const useOnrampModalStore = create<OnrampModalStore>((set) => ({
  isOpen: false,
  flow: null,
  open: (flow) => set({ isOpen: true, flow }),
  close: () => set({ isOpen: false }),
}))
