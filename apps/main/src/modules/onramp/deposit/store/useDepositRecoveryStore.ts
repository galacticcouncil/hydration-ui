import { Account } from "@galacticcouncil/web3-connect"
import { create } from "zustand"
import { persist } from "zustand/middleware"

export type DepositRecovery = {
  id: string
  source: Account
  destination: Account | null
  destinationAddress: string
  chainKey: string
  assetKey: string
  symbol: string
  amount: string
  stage: "setup" | "pending" | "transfer"
  settled?: boolean
  error?: string
  txHash?: string
}

export const useDepositRecoveryStore = create<{
  deposits: DepositRecovery[]
  save: (deposit: DepositRecovery) => void
  update: (id: string, update: Partial<DepositRecovery>) => void
}>()(
  persist(
    (set) => ({
      deposits: [],
      save: (deposit) =>
        set((state) => ({
          deposits: [
            ...state.deposits.filter((item) => item.id !== deposit.id),
            deposit,
          ],
        })),
      update: (id, update) =>
        set((state) => ({
          deposits: state.deposits.map((item) =>
            item.id === id ? { ...item, ...update } : item,
          ),
        })),
    }),
    { name: "hydration-deposit-recovery", version: 1 },
  ),
)
