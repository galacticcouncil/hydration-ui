import { createZustandStorage } from "@galacticcouncil/utils"
import { z } from "zod/v4"
import { create } from "zustand"
import { persist } from "zustand/middleware"

import { pushRecentExternalWallet } from "@/utils/recentExternalWallets"

const stateSchema = z.object({
  addresses: z.array(z.string()),
})

type State = z.infer<typeof stateSchema>

type RecentExternalWalletsStore = State & {
  readonly add: (address: string) => void
  readonly remove: (address: string) => void
}

export const useRecentExternalWallets = create<RecentExternalWalletsStore>()(
  persist(
    (set) => ({
      addresses: [],
      add: (address) =>
        set((state) => ({
          addresses: pushRecentExternalWallet(state.addresses, address),
        })),
      remove: (address) =>
        set((state) => ({
          addresses: state.addresses.filter((a) => a !== address),
        })),
    }),
    createZustandStorage({
      name: "recent-external-wallets",
      version: 1,
      schema: stateSchema,
      defaultState: { addresses: [] },
    }),
  ),
)
