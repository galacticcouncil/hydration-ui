import { create } from "zustand"
import { persist } from "zustand/middleware"

import { createDepositId } from "@/modules/onramp/config/cex"
import {
  AssetConfig,
  DepositConfig,
  DepositMethod,
  DepositScreen,
} from "@/modules/onramp/types"

const DEFAULT_CEX_ID = "kraken"

type TCreateDepositEntry = Omit<DepositConfig, "id" | "createdAt">

type DepositStore = {
  page: DepositScreen
  asset: AssetConfig | null
  cexId: string
  method: DepositMethod | null
  amount: string
  currentDeposit: DepositConfig | null
  pendingDeposits: DepositConfig[]
  setAsset: (asset: AssetConfig) => void
  setCexId: (cexId: string) => void
  setMethod: (method: DepositMethod) => void
  setAmount: (amount: string) => void
  setCurrentDeposit: (deposit: TCreateDepositEntry | null) => void
  setPendingDeposit: (deposit: TCreateDepositEntry) => void
  setFinishedDeposit: (id: string) => void
  paginateTo: (page: DepositScreen) => void
  paginateBack: () => void
  reset: () => void
}

const initialState = {
  page: DepositScreen.Select,
  asset: null,
  cexId: DEFAULT_CEX_ID,
  method: null,
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
      setMethod: (method) => set({ method }),
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
      paginateBack: () => set((state) => ({ page: state.page - 1 })),
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
