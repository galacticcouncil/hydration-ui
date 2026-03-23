import { createZustandStorage, safeParse } from "@galacticcouncil/utils"
import * as z from "zod/v4"
import { create } from "zustand"
import { persist } from "zustand/middleware"

import { validNumber } from "@/utils/validators"

const legacyTradeSettingsSchema = z.object({
  slippage: z.string().or(z.number()),
  slippageTwap: z.string().or(z.number()),
  maxRetries: z.string().or(z.number()),
})

const legacyDcaSettingsSchema = z.object({
  slippage: z.string().or(z.number()),
  maxRetries: z.string().or(z.number()),
})

const generalSettingsSchema = z.object({
  isSummaryExpanded: z.boolean(),
})

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

export const liquidityLimitSchema = z.object({
  slippage: slippageSchema,
})

export type DcaOrderSettings = z.infer<typeof dcaOrderSchema>

export const tradeSettingsSchema = z.object({
  general: generalSettingsSchema,
  swap: swapSettingsSchema,
  dca: dcaOrderSchema,
  liquidity: liquidityLimitSchema,
})

export type TradeSettings = z.infer<typeof tradeSettingsSchema>

const defaultState: TradeSettings = {
  general: { isSummaryExpanded: false },
  swap: {
    single: {
      swapSlippage: 1,
    },
    split: {
      twapSlippage: 3,
      twapMaxRetries: 5,
    },
  },
  liquidity: {
    slippage: 3,
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
    createZustandStorage({
      name: "trade-settings",
      version: 1,
      schema: tradeSettingsSchema,
      defaultState,
      migrate: (persistedState, storedVersion) => {
        switch (storedVersion) {
          case 0:
            return migrateLegacySettings()
          default:
            return persistedState as TradeSettings
        }
      },
    }),
  ),
)

const LEGACY_TRADE_SETTINGS_STORE = "trade.settings"
const LEGACY_DCA_SETTINGS_STORE = "dca.settings"

function migrateLegacySettings() {
  const rawTrade = window.localStorage.getItem(LEGACY_TRADE_SETTINGS_STORE)
  const legacyTrade = legacyTradeSettingsSchema.safeParse(
    rawTrade ? safeParse(rawTrade) : null,
  )

  const rawDca = window.localStorage.getItem(LEGACY_DCA_SETTINGS_STORE)
  const legacyDca = legacyDcaSettingsSchema.safeParse(
    rawDca ? safeParse(rawDca) : null,
  )

  if (legacyTrade.success) {
    window.localStorage.removeItem(LEGACY_TRADE_SETTINGS_STORE)
  }

  if (legacyDca.success) {
    window.localStorage.removeItem(LEGACY_DCA_SETTINGS_STORE)
  }

  return {
    ...defaultState,
    swap: legacyTrade.success
      ? {
          single: { swapSlippage: Number(legacyTrade.data.slippage) },
          split: {
            twapSlippage: Number(legacyTrade.data.slippageTwap),
            twapMaxRetries: Number(legacyTrade.data.maxRetries),
          },
        }
      : defaultState.swap,
    dca: legacyDca.success
      ? {
          slippage: Number(legacyDca.data.slippage),
          maxRetries: Number(legacyDca.data.maxRetries),
        }
      : defaultState.dca,
  }
}
