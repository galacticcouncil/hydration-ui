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

const SyncChannel = new BroadcastChannel("hydration:neckwork-sync")

const armState = (blockHeight: number) => (state: NeckworkSyncStore) => ({
  armedForBlock: Math.max(state.armedForBlock ?? 0, blockHeight),
  armedAt: Date.now(),
})

export const useNeckworkSyncStore = create<NeckworkSyncStore>()((set) => ({
  armedForBlock: null,
  armedAt: null,
  arm: (blockHeight) => {
    set(armState(blockHeight))
    SyncChannel.postMessage(blockHeight)
  },
  disarm: () => set({ armedForBlock: null, armedAt: null }),
}))

SyncChannel.onmessage = (event: MessageEvent<number>) =>
  useNeckworkSyncStore.setState(armState(event.data))
