import { createZustandStorage } from "@galacticcouncil/utils"
import { z } from "zod/v4"
import { create } from "zustand"
import { persist } from "zustand/middleware"

const cachedBalanceSchema = z.object({
  balance: z.number(),
  symbol: z.string().optional(),
})

const stateSchema = z.object({
  balances: z.record(z.string(), cachedBalanceSchema),
})

export type CachedBalance = z.infer<typeof cachedBalanceSchema>

type State = z.infer<typeof stateSchema>

type BalanceCacheStore = State & {
  readonly save: (balances: ReadonlyMap<string, CachedBalance>) => void
}

/**
 * Last fetched account balances, so the account list can sort and show them
 * on load until fresh ones arrive.
 */
export const useBalanceCache = create<BalanceCacheStore>()(
  persist(
    (set) => ({
      balances: {},
      save: (balances) => {
        if (balances.size === 0) return
        set((state) => ({
          balances: { ...state.balances, ...Object.fromEntries(balances) },
        }))
      },
    }),
    createZustandStorage({
      name: "web3-connect-balances",
      version: 1,
      schema: stateSchema,
      defaultState: { balances: {} },
    }),
  ),
)
