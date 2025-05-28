import * as z from "zod"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

const singleTradeSchema = z.object({
  swapSlippage: z.number().min(0).max(100),
})

export type SingleTradeSettings = z.infer<typeof singleTradeSchema>

const splitTradeSchema = z.object({
  twapSlippage: z.number().min(0).max(100),
  twapMaxRetries: z.number().min(0).max(10),
})

export type SplitTradeSettings = z.infer<typeof splitTradeSchema>

export const tradeSettingsSchema = z.object({
  single: singleTradeSchema,
  split: splitTradeSchema,
})

export type TradeSettings = z.infer<typeof tradeSettingsSchema>

const version = 1

const defaultState: TradeSettings = {
  single: {
    swapSlippage: 0.5,
  },
  split: {
    twapSlippage: 0.5,
    twapMaxRetries: 5,
  },
}

const versionedStateSchema = z.object({
  version: z.number(),
  state: tradeSettingsSchema,
})

type VersionedState = z.infer<typeof versionedStateSchema>

type TradeSettingsStore = TradeSettings & {
  update: (values: TradeSettings) => void
}

export const useTradeSettings = create<TradeSettingsStore>()(
  persist(
    (set) => ({
      ...defaultState,
      update: (values) => set(values),
    }),
    {
      name: "trade.settings",
      version,
      storage: createJSONStorage(() => ({
        getItem: async (name) => {
          const data = window.localStorage.getItem(name)

          if (data) {
            try {
              const parsedData = JSON.parse(data)
              const validatedData = versionedStateSchema.safeParse(parsedData)

              if (
                validatedData.success &&
                validatedData.data.version === version
              ) {
                return JSON.stringify(validatedData.data)
              }
            } catch (err) {
              console.error(err)
            }
          }

          return JSON.stringify({
            version,
            state: {
              ...defaultState,
            },
          } satisfies VersionedState)
        },
        setItem(name, value) {
          window.localStorage.setItem(name, value)
        },
        removeItem(name) {
          window.localStorage.removeItem(name)
        },
      })),
    },
  ),
)
