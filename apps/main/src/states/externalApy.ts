import { createZustandStorage } from "@galacticcouncil/utils"
import { millisecondsInWeek } from "date-fns/constants"
import z from "zod/v4"
import { create } from "zustand"
import { persist } from "zustand/middleware"

export const externalApyEntrySchema = z.object({
  id: z.string(),
  apy: z.number(),
  timestamp: z.number(),
})

export type ExternalApyEntry = z.infer<typeof externalApyEntrySchema>

const externalApyStateSchema = z.object({
  entries: z.record(z.string(), externalApyEntrySchema),
})

type ExternalApyState = z.infer<typeof externalApyStateSchema>

type ExternalApyActions = {
  setApy: (id: string, apy: number) => void
}

type ExternalApyStore = ExternalApyState & ExternalApyActions

const EXTERNAL_APY_CACHE_TTL_MS = millisecondsInWeek

const defaultState: ExternalApyState = {
  entries: {},
}

export const useExternalApyStore = create<ExternalApyStore>()(
  persist(
    (set) => ({
      ...defaultState,
      setApy: (id, apy) =>
        set((state) => ({
          entries: {
            ...state.entries,
            [id]: { id, apy, timestamp: Date.now() },
          },
        })),
    }),
    createZustandStorage({
      name: "external-apy",
      version: 1,
      schema: externalApyStateSchema,
      defaultState,
    }),
  ),
)

export const getCachedExternalApy = (id: string) =>
  useExternalApyStore.getState().entries[id]

export const fetchExternalApyWithCache = async (
  id: string,
  fetcher: () => Promise<number>,
): Promise<number | null> => {
  try {
    const apy = await fetcher()
    useExternalApyStore.getState().setApy(id, apy)
    return apy
  } catch (error) {
    const cached = getCachedExternalApy(id)

    if (
      cached !== undefined &&
      Date.now() - cached.timestamp <= EXTERNAL_APY_CACHE_TTL_MS
    ) {
      return cached.apy
    } else {
      return null
    }
  }
}
