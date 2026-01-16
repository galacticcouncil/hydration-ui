import { create } from "zustand"
import { persist } from "zustand/middleware"

import { createDepositId } from "@/modules/onramp/config/cex"
import {
  AssetConfig,
  DepositConfig,
  OnrampScreen,
} from "@/modules/onramp/types"

const DEFAULT_CEX_ID = "kraken"

type TCreateDepositEntry = Omit<DepositConfig, "id" | "createdAt">

type DepositStore = {
  page: OnrampScreen
  asset: AssetConfig | null
  cexId: string
  amount: string
  currentDeposit: DepositConfig | null
  pendingDeposits: DepositConfig[]
  setAsset: (asset: AssetConfig) => void
  setCexId: (cexId: string) => void
  setAmount: (amount: string) => void
  setCurrentDeposit: (deposit: TCreateDepositEntry | null) => void
  setPendingDeposit: (deposit: TCreateDepositEntry) => void
  setFinishedDeposit: (id: string) => void
  paginateTo: (page: OnrampScreen) => void
  reset: () => void
}

const initialState = {
  page: OnrampScreen.MethodSelect,
  asset: null,
  cexId: DEFAULT_CEX_ID,
  amount: "",
  currentDeposit: null,
  pendingDeposits: [],
}

export const useDepositStore = create(
  persist<DepositStore>(
    (set) => ({
      ...initialState,
      setAsset: (asset) => set({ asset }),
      setCexId: (cexId) => set({ cexId }),
      setAmount: (amount) => set({ amount }),
      setCurrentDeposit: (deposit) =>
        set({
          currentDeposit: deposit
            ? {
                ...deposit,
                createdAt: Date.now(),
                id: createDepositId(deposit.asset.assetId, deposit.address),
              }
            : null,
        }),
      setPendingDeposit: (deposit) =>
        set((state) => {
          // remove previous deposit with the same id
          const filteredPendingDeposits = state.pendingDeposits.filter(
            ({ id }) =>
              id !== createDepositId(deposit.asset.assetId, deposit.address),
          )

          return {
            pendingDeposits: [
              ...filteredPendingDeposits,
              {
                ...deposit,
                createdAt: Date.now(),
                id: createDepositId(deposit.asset.assetId, deposit.address),
              },
            ],
          }
        }),
      setFinishedDeposit: (id) =>
        set((state) => ({
          pendingDeposits: state.pendingDeposits.filter(
            (deposit) => deposit.id !== id,
          ),
        })),
      paginateTo: (page) => set({ page }),
      reset: () =>
        set((state) => ({
          ...initialState,
          currentDeposit: state.currentDeposit,
          pendingDeposits: state.pendingDeposits,
        })),
    }),
    {
      name: "onramp",
      version: 0.2,
      partialize: (state) => ({
        ...state,
        ...initialState,
        pendingDeposits: state.pendingDeposits,
      }),
    },
  ),
)

export const selectPendingDepositsByAccount =
  (address?: string) => (state: DepositStore) =>
    address
      ? state.pendingDeposits.filter((deposit) => deposit.address === address)
      : []
