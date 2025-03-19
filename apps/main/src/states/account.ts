import { isDeepEqual } from "remeda"
import { create, StateCreator } from "zustand"

import {
  OmnipoolDepositFull,
  OmnipoolPosition,
  XykDeposit,
} from "@/api/account"

type Balance = {
  assetId: string
  free: bigint
  reserved: bigint
  total: bigint
}

type Positions = {
  omnipool: OmnipoolPosition[]
  omnipoolMining: OmnipoolDepositFull[]
  xykMining: XykDeposit[]
}

type BalanceRecord = Record<string, Balance>

type BalanceStorageSlice = {
  balances: BalanceRecord
  isBalanceLoading: boolean
  setBalance: (balances: Balance[]) => void
}

type PositionsStorageSlice = {
  positions: Positions
  isPositionsLoading: boolean
  setPositions: (positions: Positions) => void
}

const createAccountsBalances: StateCreator<
  BalanceStorageSlice & PositionsStorageSlice,
  [],
  [],
  BalanceStorageSlice
> = (set) => ({
  balances: {},
  isBalanceLoading: true,
  setBalance: (balances) =>
    set((state) => {
      const newBalances = { ...state.balances }

      balances.forEach((balance) => (newBalances[balance.assetId] = balance))

      if (isDeepEqual(newBalances, state.balances)) {
        return { ...state.balances, isBalanceLoading: false }
      }

      return { balances: newBalances, isBalanceLoading: false }
    }),
})

const createAccountsUniques: StateCreator<
  BalanceStorageSlice & PositionsStorageSlice,
  [],
  [],
  PositionsStorageSlice
> = (set) => ({
  positions: { omnipool: [], omnipoolMining: [], xykMining: [] },
  isPositionsLoading: true,
  setPositions: (positions) =>
    set(() => ({ positions, isPositionsLoading: false })),
})

export const useAccountData = create<
  BalanceStorageSlice & PositionsStorageSlice
>((...a) => ({
  ...createAccountsBalances(...a),
  ...createAccountsUniques(...a),
}))
