import { create } from "zustand"
import { persist } from "zustand/middleware"

type BlastCampaignStore = {
  seenWinningAssetIds: Record<string, string[]>
  markAsSeen: (address: string, assetIds: string[]) => void
  getSeenAssetIds: (address: string) => string[]
}

export const useBlastCampaignStore = create<BlastCampaignStore>()(
  persist(
    (set, get) => ({
      seenWinningAssetIds: {},
      markAsSeen: (address: string, assetIds: string[]) =>
        set((state) => {
          if (!address) return state
          const currentSeenIds = state.seenWinningAssetIds[address] || []
          return {
            seenWinningAssetIds: {
              ...state.seenWinningAssetIds,
              [address]: [...new Set([...currentSeenIds, ...assetIds])],
            },
          }
        }),
      getSeenAssetIds: (address: string) => {
        const state = get()
        return state.seenWinningAssetIds[address] || []
      },
    }),
    {
      name: "blast-campaign",
      version: 0,
    },
  ),
)
