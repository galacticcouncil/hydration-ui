import { create } from "zustand"

type NeckworkStore = {
  alive: boolean
}

export const useNeckworkStore = create<NeckworkStore>()(() => ({
  alive: false,
}))

export const useNeckworkEnabled = (): boolean =>
  useNeckworkStore((state) => state.alive)

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
