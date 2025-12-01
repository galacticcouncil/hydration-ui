import { Balance as SdkBalance } from "@galacticcouncil/sdk-next"
import { produce } from "immer"
import { useCallback, useMemo } from "react"
import { pick } from "remeda"
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

export type DepositPosition =
  | XykDeposit
  | OmnipoolDepositFull
  | OmnipoolDepositFullWithData

export const isDepositPosition = (
  position:
    | DepositPosition
    | OmnipoolPositionWithData
    | AccountOmnipoolPosition,
): position is DepositPosition => "yield_farm_entries" in position

export const isXykDepositPosition = (
  position: DepositPosition,
): position is XykDeposit => "amm_pool_id" in position

export const isOmnipoolDepositPosition = (
  position: OmnipoolPosition | OmnipoolDepositFull,
): position is OmnipoolDepositFull => "yield_farm_entries" in position

export const isOmnipoolDepositFullPosition = (
  position: AccountOmnipoolPosition,
): position is OmnipoolDepositFullWithData => "yield_farm_entries" in position

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
  omnipool: OmnipoolPosition[]
  omnipoolMining: OmnipoolDepositFull[]
  xykMining: XykDeposit[]
  setOmnipoolPositions: (positions: OmnipoolPosition[]) => void
  setOmnipoolMiningPositions: (positions: OmnipoolDepositFull[]) => void
  setXykMiningPositions: (positions: XykDeposit[]) => void
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
    set((state) =>
      produce(state, (draft) => {
        balances.forEach((balance) => {
          if (balance.total > 0n) {
            draft.balances[balance.assetId] = balance
          } else {
            delete draft.balances[balance.assetId]
          }
        })
      }),
    ),
  resetBalances: () => set(store.getInitialState()),
  balancesLoaded: () => set({ isBalanceLoading: false }),
})

const createAccountsUniques: StateCreator<
  BalanceStorageSlice & PositionsStorageSlice,
  [],
  [],
  PositionsStorageSlice
> = (set) => ({
  omnipool: [],
  omnipoolMining: [],
  xykMining: [],
  setOmnipoolPositions: (positions) => set({ omnipool: positions }),
  setOmnipoolMiningPositions: (positions) => set({ omnipoolMining: positions }),
  setXykMiningPositions: (positions) => set({ xykMining: positions }),
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

  const getTransferableBalance = useCallback(
    (assetId: string) => balances[assetId]?.transferable ?? 0n,
    [balances],
  )

  return {
    balances,
    getBalance,
    getTransferableBalance,
    isBalanceLoading,
  }
}

export const useAccountBalance = (assetId: AssetId): Balance | undefined => {
  const { balances } = useAccountBalances()
  return balances[assetId.toString()]
}

export const useAccountPositions = () => {
  const { omnipool, omnipoolMining, xykMining } = useAccountData(
    useShallow(pick(["omnipool", "omnipoolMining", "xykMining"])),
  )

  const isPositions =
    omnipool.length > 0 || omnipoolMining.length > 0 || xykMining.length > 0

  const positions = {
    omnipool,
    omnipoolMining,
    xykMining,
  }

  const positionsAmount =
    omnipool.length + omnipoolMining.length + xykMining.length

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

  return {
    positions,
    positionsAmount,
    isPositions,
    getPositions,
  }
}

export const useAccountOmnipoolPositionsData = () => {
  const {
    omnipool: omnipoolPositions,
    omnipoolMining: omnipoolMiningPositions,
  } = useAccountData(useShallow(pick(["omnipool", "omnipoolMining"])))

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
