import { create } from "zustand"
import { persist } from "zustand/middleware"

import { useRpcProvider } from "@/providers/rpcProvider"

type IntentsState = {
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

export const useHasIntentPallet = () =>
  useRpcProvider().featureFlags.isIceEnabled

export const useIsIceEnabled = () => {
  const { featureFlags } = useRpcProvider()
  const enabled = useIntentsStore((state) => state.enabled)

  return featureFlags.isIceEnabled && enabled
}
