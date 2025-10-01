import { Balance as SdkBalance } from "@galacticcouncil/sdk-next"
import Big from "big.js"
import { useCallback, useMemo } from "react"
import { isDeepEqual, pick, prop } from "remeda"
import { create, StateCreator } from "zustand"
import { useShallow } from "zustand/react/shallow"

import {
  OmnipoolDepositFull,
  OmnipoolPosition,
  XykDeposit,
} from "@/api/account"
import { AssetId } from "@/providers/assetsProvider"

import { OmnipoolPositionData, useOmnipoolPositionData } from "./liquidity"

export type Balance = SdkBalance & {
  assetId: string
}

export type Positions = {
  omnipool: OmnipoolPosition[]
  omnipoolMining: OmnipoolDepositFull[]
  xykMining: XykDeposit[]
}

export const isOmnipoolDepositPosition = (
  position: OmnipoolPosition | OmnipoolDepositFull,
): position is OmnipoolDepositFull => "yield_farm_entries" in position

export type OmnipoolPositionWithData = OmnipoolPosition & {
  data: OmnipoolPositionData
}

export type OmnipoolDepositFullWithData = OmnipoolDepositFull & {
  data: OmnipoolPositionData
}

export type AccountOmnipoolPosition =
  | OmnipoolPositionWithData
  | OmnipoolDepositFullWithData

type AccountOmnipoolPositions = {
  omnipool: OmnipoolPositionWithData[]
  omnipoolMining: OmnipoolDepositFullWithData[]
  all: AccountOmnipoolPosition[]
}

type BalanceRecord = Record<string, Balance>

type BalanceStorageSlice = {
  balances: BalanceRecord
  isBalanceLoading: boolean
  setBalance: (balances: Balance[]) => void
  resetBalances: () => void
  balancesLoaded: () => void
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
> = (set, _get, store) => ({
  balances: {},
  isBalanceLoading: true,
  setBalance: (balances) =>
    set((state) => {
      const newBalances = { ...state.balances }

      balances.forEach((balance) => (newBalances[balance.assetId] = balance))

      if (isDeepEqual(newBalances, state.balances)) {
        return { balances: state.balances }
      }

      return { balances: newBalances }
    }),
  resetBalances: () => set(store.getInitialState()),
  balancesLoaded: () => set({ isBalanceLoading: false }),
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
  const { balances, isBalanceLoading } = useAccountData(
    useShallow(pick(["balances", "isBalanceLoading"])),
  )

  const getBalance = useCallback(
    (assetId: AssetId) => balances[assetId.toString()],
    [balances],
  )

  const getFreeBalance = useCallback(
    (assetId: AssetId) => balances[assetId.toString()]?.free ?? 0n,
    [balances],
  )

  return { balances, getBalance, getFreeBalance, isBalanceLoading }
}

export const useAccountBalance = (assetId: AssetId): Balance | undefined => {
  const { balances } = useAccountBalances()
  return balances[assetId.toString()]
}

export const useAccountPositions = () => {
  const { positions, isPositionsLoading } = useAccountData(
    useShallow(pick(["positions", "isPositionsLoading"])),
  )
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

  return { positions, isPositions, isPositionsLoading, getPositions }
}

export const useAccountOmnipoolPositionsData = () => {
  const positions = useAccountData(prop("positions"))
  const {
    omnipool: omnipoolPositions,
    omnipoolMining: omnipoolMiningPositions,
  } = positions
  const isPositions =
    omnipoolPositions.length > 0 || omnipoolMiningPositions.length > 0

  const { isLoading, getData } = useOmnipoolPositionData(isPositions)

  const data = useMemo((): AccountOmnipoolPositions | undefined => {
    if (isLoading) return undefined

    const omnipool: OmnipoolPositionWithData[] = []
    const omnipoolMining: OmnipoolDepositFullWithData[] = []

    for (const position of omnipoolPositions) {
      const data = getData(position)

      if (data) {
        omnipool.push({ ...position, data })
      }
    }

    for (const position of omnipoolMiningPositions) {
      const data = getData(position)

      if (data) {
        omnipoolMining.push({ ...position, data })
      }
    }

    return {
      omnipool,
      omnipoolMining,
      all: [...omnipool, ...omnipoolMining],
    }
  }, [getData, isLoading, omnipoolPositions, omnipoolMiningPositions])

  const getAssetPositions = useCallback(
    (id: string): AccountOmnipoolPositions => {
      const omnipool =
        data?.omnipool.filter((position) => position.assetId === id) ?? []
      const omnipoolMining =
        data?.omnipoolMining.filter((position) => position.assetId === id) ?? []

      return { omnipool, omnipoolMining, all: [...omnipool, ...omnipoolMining] }
    },

    [data],
  )

  return { data, isLoading, getAssetPositions }
}
