import { createZustandStorage } from "@galacticcouncil/utils"
import * as z from "zod/v4"
import { create } from "zustand"
import { persist } from "zustand/middleware"

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
      storage: createZustandStorage(version, tradeSettingsSchema, defaultState),
    },
  ),
)
