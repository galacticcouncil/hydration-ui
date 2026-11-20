import { createZustandStorage } from "@galacticcouncil/utils"
import * as z from "zod/v4"
import { create } from "zustand"
import { persist } from "zustand/middleware"

import i18n from "@/i18n"
import { MIN_TRADE_SLIPPAGE } from "@/states/tradeSettings"
import { validNumber } from "@/utils/validators"

// Each loop step loses up to this much and the losses compound, so the cap
// stays well below what the contract accepts (99.99%).
export const MAX_LOOPER_SLIPPAGE = 5
export const LOOPER_SLIPPAGE_OPTIONS = [0.5, 1, 2]

export const looperSlippageSchema = z.object({
  slippage: validNumber
    .min(
      MIN_TRADE_SLIPPAGE,
      i18n.t("error.minNumber", { value: MIN_TRADE_SLIPPAGE }),
    )
    .max(
      MAX_LOOPER_SLIPPAGE,
      i18n.t("error.maxNumber", { value: MAX_LOOPER_SLIPPAGE }),
    ),
})

type LooperSettings = z.infer<typeof looperSlippageSchema>

const defaultState: LooperSettings = { slippage: 1 }

export const useLooperSettings = create<
  LooperSettings & { setSlippage: (slippage: number) => void }
>()(
  persist(
    (set) => ({
      ...defaultState,
      setSlippage: (slippage) => set({ slippage }),
    }),
    createZustandStorage({
      name: "looper-settings",
      version: 1,
      schema: looperSlippageSchema,
      defaultState,
    }),
  ),
)

/** The looper slippage in the contract's basis points. */
export const useLooperSlippageBps = () =>
  useLooperSettings((s) => Math.round(s.slippage * 100))
