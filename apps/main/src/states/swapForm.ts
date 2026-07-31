import { create } from "zustand"

type SwapFormState = {
  sellAmount: string
  setSellAmount: (sellAmount: string) => void
}

export const useSwapForm = create<SwapFormState>((set) => ({
  sellAmount: "",
  setSellAmount: (sellAmount) => set({ sellAmount }),
}))
