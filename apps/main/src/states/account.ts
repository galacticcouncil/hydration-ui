import Big from "big.js"
import { useCallback, useMemo } from "react"
import { isDeepEqual, prop } from "remeda"
import { create, StateCreator } from "zustand"

import {
  OmnipoolDepositFull,
  OmnipoolPosition,
  XykDeposit,
} from "@/api/account"

import { useOmnipoolPositionData } from "./liquidity"

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
  positionsAmount: number | undefined
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
        return { balances: state.balances, isBalanceLoading: false }
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
  positionsAmount: undefined,
  hasPositions: false,
  setPositions: (positions) =>
    set(() => {
      const omnipoolAmount = positions.omnipool.length
      const omnipoolMiningAmount = positions.omnipoolMining.length
      const xykMiningAmount = positions.xykMining.length

      const positionsAmount = Big(omnipoolAmount)
        .plus(omnipoolMiningAmount)
        .plus(xykMiningAmount)
        .toNumber()

      const hasPositions =
        omnipoolAmount > 0 || omnipoolMiningAmount > 0 || xykMiningAmount > 0

      return {
        positions,
        isPositionsLoading: false,
        hasPositions,
        positionsAmount,
      }
    }),
})

export const useAccountData = create<
  BalanceStorageSlice & PositionsStorageSlice
>((...a) => ({
  ...createAccountsBalances(...a),
  ...createAccountsUniques(...a),
}))

export const useAccountBalances = () => {
  const balances = useAccountData(prop("balances"))

  const getBalance = useCallback(
    (assetId: string) => balances[assetId],
    [balances],
  )

  return { balances, getBalance }
}

export const useAccountPositions = () => {
  const positions = useAccountData(prop("positions"))
  const { omnipool, omnipoolMining, xykMining } = positions
  const isPositions = omnipool.length > 0 || omnipoolMining.length > 0

  const getPositions = useCallback(
    (id: string) => {
      const omnipoolPositions = omnipool.filter(
        (position) => position.assetId === id,
      )
      const omnipoolMiningPositions = omnipoolMining.filter(
        (position) => position.assetId === id,
      )
      const xykMiningPositions = xykMining.filter(
        (position) => position.amm_pool_id === id,
      )

      return { omnipoolPositions, omnipoolMiningPositions, xykMiningPositions }
    },

    [omnipool, omnipoolMining, xykMining],
  )

  return { positions, isPositions, getPositions }
}

export const useAccountOmnipoolPositionsData = () => {
  const positions = useAccountData(prop("positions"))
  const { omnipool, omnipoolMining } = positions
  const isPositions = omnipool.length > 0 || omnipoolMining.length > 0

  const { isLoading, getData } = useOmnipoolPositionData(isPositions)

  const data = useMemo(() => {
    if (!isLoading) {
      return {
        omnipool: omnipool.map((position) => {
          const data = getData(position)
          return { ...position, data }
        }),
        omnipoolMining: omnipoolMining.map((position) => {
          const data = getData(position)
          return { ...position, data }
        }),
      }
    }
  }, [getData, isLoading, omnipool, omnipoolMining])

  return { data, isLoading }
}
