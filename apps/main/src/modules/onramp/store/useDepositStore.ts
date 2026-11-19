import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { DepositGroupBy } from "@/modules/onramp/deposit/onchain/DepositDiscovery.utils"

type DepositStore = {
  groupBy: DepositGroupBy
  setGroupBy: (groupBy: DepositGroupBy) => void
}

export const useDepositStore = create(
  persist<DepositStore>(
    (set) => ({
      groupBy: "none",
      setGroupBy: (groupBy) => set({ groupBy }),
    }),
    { name: "deposit" },
  ),
)
