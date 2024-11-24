import { create } from "zustand"
import { persist } from "zustand/middleware"

type ClaimingRangeStore = {
  range: string
  update: (value: string) => void
}

export const useClaimingRange = create<ClaimingRangeStore>()(
  persist(
    (set) => ({
      range: "0.99",
      update: (value) => set(() => ({ range: value })),
    }),
    {
      name: "claiming-range",
    },
  ),
)

export const WARNING_LIMIT = 50
export const DEFAULT_VALUE = 99
