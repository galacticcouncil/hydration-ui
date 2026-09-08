import { create } from "zustand"
import { persist } from "zustand/middleware"

import { useRpcProvider } from "@/providers/rpcProvider"

type IntentsState = {
  /** The user's opt-in. Separate from the chain's capability flag. */
  enabled: boolean
  hasSeenModal: boolean
}

type IntentsActions = {
  setEnabled: (value: boolean) => void
  dismissModal: () => void
}

export type IntentsStore = IntentsState & IntentsActions

export const useIntentsStore = create<IntentsStore>()(
  persist(
    (set) => ({
      enabled: false,
      hasSeenModal: false,
      setEnabled: (enabled) => set({ enabled }),
      dismissModal: () => set({ hasSeenModal: true }),
    }),
    { name: "intents", version: 1 },
  ),
)

/**
 * The effective intents flag: the chain exposes the Intent pallet AND the user
 * has opted in. Every consumer should read this rather than
 * `featureFlags.isIceEnabled`, which only answers the first half.
 */
export const useIsIceEnabled = () => {
  const { featureFlags } = useRpcProvider()
  const enabled = useIntentsStore((state) => state.enabled)

  return featureFlags.isIceEnabled && enabled
}
