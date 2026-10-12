import { createZustandStorage } from "@galacticcouncil/utils"
import * as z from "zod/v4"
import { create } from "zustand"
import { persist } from "zustand/middleware"

const MAX_RECENT_RECIPIENTS = 3

const recentRecipientsSchema = z.object({
  byChain: z.record(z.string(), z.array(z.string())),
})

type RecentRecipientsState = z.infer<typeof recentRecipientsSchema>

type RecentRecipientsStore = RecentRecipientsState & {
  remember: (chainKey: string, address: string) => void
}

const defaultState: RecentRecipientsState = { byChain: {} }

export const useRecentRecipientsStore = create<RecentRecipientsStore>()(
  persist(
    (set) => ({
      ...defaultState,
      remember: (chainKey, address) =>
        set((state) => ({
          byChain: {
            ...state.byChain,
            [chainKey]: [
              address,
              ...(state.byChain[chainKey] ?? []).filter(
                (recent) => recent !== address,
              ),
            ].slice(0, MAX_RECENT_RECIPIENTS),
          },
        })),
    }),
    createZustandStorage({
      name: "xc-swap-recent-recipients",
      version: 1,
      schema: recentRecipientsSchema,
      defaultState,
      migrate: () => defaultState,
    }),
  ),
)
