import { create } from "zustand"
import { persist } from "zustand/middleware"

type BlastCampaignStore = {
  seenWinningAssetIds: string[]
  markAsSeen: (assetIds: string[]) => void
}

export const useBlastCampaignStore = create<BlastCampaignStore>()(
  persist(
    (set) => ({
      seenWinningAssetIds: [],
      markAsSeen: (assetIds: string[]) =>
        set((state) => ({
          seenWinningAssetIds: [
            ...new Set([...state.seenWinningAssetIds, ...assetIds]),
          ],
        })),
    }),
    {
      name: "blast-campaign",
      version: 0,
    },
  ),
)
