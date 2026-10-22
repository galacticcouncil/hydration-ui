import { NeckworkStatus } from "@galacticcouncil/indexer/neckwork"
import { create } from "zustand"

/**
 * "unknown" means no probe has landed yet. The app stays on the primary source
 * rather than flashing legacy content.
 */
export type NeckworkHealth = "alive" | "dead" | "unknown"

/** Result of one /v1/status probe, before classification. */
export type NeckworkProbe =
  | { kind: "ok"; status: NeckworkStatus }
  | { kind: "http"; statusCode: number }
  | { kind: "network" }
  | { kind: "timeout" }

/**
 * Only a hard outage drops the app to the legacy source. A rate limit (429) or
 * any other client error leaves health "unknown" and the next poll decides.
 */
export const classifyNeckworkProbe = (probe: NeckworkProbe): NeckworkHealth => {
  switch (probe.kind) {
    case "ok":
      return "alive"
    case "network":
    case "timeout":
      return "dead"
    case "http":
      return probe.statusCode >= 500 ? "dead" : "unknown"
  }
}

type NeckworkStore = {
  health: NeckworkHealth
}

export const useNeckworkStore = create<NeckworkStore>()(() => ({
  health: "unknown",
}))

export const useNeckworkEnabled = (): boolean =>
  useNeckworkStore((state) => state.health) !== "dead"

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
