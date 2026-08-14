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
