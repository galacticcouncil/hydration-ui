import { create } from "zustand"

import { ENV } from "@/config/env"

type NeckworkStore = {
  alive: boolean
}

export const useNeckworkStore = create<NeckworkStore>()(() => ({
  alive: false,
}))

export const useNeckworkEnabled = (): boolean => {
  const alive = useNeckworkStore((state) => state.alive)

  return ENV.VITE_NECKWORK_ENABLED && alive
}

type NeckworkSyncStore = {
  armedForBlock: number | null
  armedAt: number | null
  arm: (blockHeight: number) => void
  disarm: () => void
}

export const useNeckworkSyncStore = create<NeckworkSyncStore>()((set) => ({
  armedForBlock: null,
  armedAt: null,
  arm: (blockHeight) =>
    set((state) => ({
      armedForBlock: Math.max(state.armedForBlock ?? 0, blockHeight),
      armedAt: Date.now(),
    })),
  disarm: () => set({ armedForBlock: null, armedAt: null }),
}))
