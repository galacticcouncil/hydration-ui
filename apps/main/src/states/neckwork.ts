import { createZustandStorage } from "@galacticcouncil/utils"
import z from "zod/v4"
import { create } from "zustand"
import { persist } from "zustand/middleware"

import { ENV } from "@/config/env"

const neckworkStateSchema = z.object({
  override: z.boolean().nullable(),
})

type NeckworkState = z.infer<typeof neckworkStateSchema>

type NeckworkActions = {
  setOverride: (override: boolean | null) => void
}

type NeckworkStore = NeckworkState & NeckworkActions

const defaultState: NeckworkState = {
  override: null,
}

export const useNeckworkStore = create<NeckworkStore>()(
  persist(
    (set) => ({
      ...defaultState,
      setOverride: (override) => set({ override }),
    }),
    createZustandStorage({
      name: "neckwork",
      version: 1,
      schema: neckworkStateSchema,
      defaultState,
    }),
  ),
)

export const useNeckworkEnabled = (): boolean =>
  useNeckworkStore((state) => state.override ?? ENV.VITE_NECKWORK_ENABLED)

/**
 * Neckwork indexes the chain with a lag, so a tx that just landed in a best
 * block is provably not queryable yet. `useNeckworkSync` arms this store with
 * the block the tx landed in, polls the indexer head, and invalidates the
 * account-scoped queries once it catches up.
 *
 * Deliberately not persisted — a rehydrated `armedForBlock` would start a poll
 * on page load for a tx from a previous session.
 */
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
      // never regress — a second tx while armed must not disarm the newer one
      armedForBlock: Math.max(state.armedForBlock ?? 0, blockHeight),
      // a fresh tx deserves a full window, so the timeout clock restarts
      armedAt: Date.now(),
    })),
  disarm: () => set({ armedForBlock: null, armedAt: null }),
}))
