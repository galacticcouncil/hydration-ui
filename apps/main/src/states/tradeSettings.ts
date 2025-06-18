import * as z from "zod/v4"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import { validNumber } from "@/utils/validators"

const slippageSchema = validNumber.min(0).max(100)
const maxRetriesSchema = validNumber.min(0).max(10)

export const singleTradeSchema = z.object({
  swapSlippage: slippageSchema,
})

export type SingleTradeSettings = z.infer<typeof singleTradeSchema>

export const splitTradeSchema = z.object({
  twapSlippage: slippageSchema,
  twapMaxRetries: maxRetriesSchema,
})

export type SplitTradeSettings = z.infer<typeof splitTradeSchema>

export const swapSettingsSchema = z.object({
  single: singleTradeSchema,
  split: splitTradeSchema,
})

export type SwapSettings = z.infer<typeof swapSettingsSchema>

export const dcaOrderSchema = z.object({
  slippage: slippageSchema,
  maxRetries: maxRetriesSchema,
})

export type DcaOrderSettings = z.infer<typeof dcaOrderSchema>

export const tradeSettingsSchema = z.object({
  swap: swapSettingsSchema,
  dca: dcaOrderSchema,
})

export type TradeSettings = z.infer<typeof tradeSettingsSchema>

const version = 1

const defaultState: TradeSettings = {
  swap: {
    single: {
      swapSlippage: 1,
    },
    split: {
      twapSlippage: 3,
      twapMaxRetries: 5,
    },
  },
  dca: {
    slippage: 1,
    maxRetries: 5,
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
