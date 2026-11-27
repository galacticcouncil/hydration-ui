import { create } from "zustand"
import { persist } from "zustand/middleware"

import { useRpcProvider } from "@/providers/rpcProvider"

type IntentsState = {
  hasSeenModal: boolean
}

type IntentsActions = {
  dismissModal: () => void
}

export type IntentsStore = IntentsState & IntentsActions

// Persisted state from before intents were mandatory may still hold `enabled`;
// nothing reads it, and bumping `version` without a migrate would reset hasSeenModal
export const useIntentsStore = create<IntentsStore>()(
  persist(
    (set) => ({
      hasSeenModal: false,
      dismissModal: () => set({ hasSeenModal: true }),
    }),
    { name: "intents", version: 1 },
  ),
)

export const useHasIntentPallet = () =>
  useRpcProvider().featureFlags.isIceEnabled
