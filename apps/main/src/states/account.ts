import { useCallback, useMemo } from "react"

import {
  OmnipoolDepositFull,
  OmnipoolPosition,
  useAccountOmnipoolMiningPositions,
  useAccountOmnipoolPositions,
  useAccountXykMiningPositions,
  XykDeposit,
} from "@/api/account"

import { OmnipoolPositionData, useOmnipoolPositionData } from "./liquidity"

export type Positions = {
  omnipool: OmnipoolPosition[]
  omnipoolMining: OmnipoolDepositFull[]
  xykMining: XykDeposit[]
}

export type XYKDepositPrice = XykDeposit & {
  price: string | undefined
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

export const useAccountPositions = () => {
  const { data: omnipool = [], isLoading: isOmnipoolLoading } =
    useAccountOmnipoolPositions()
  const { data: omnipoolMining = [], isLoading: isOmnipoolMiningLoading } =
    useAccountOmnipoolMiningPositions()
  const { data: xykMining = [], isLoading: isXykMiningLoading } =
    useAccountXykMiningPositions()

  const isLoading =
    isOmnipoolLoading || isOmnipoolMiningLoading || isXykMiningLoading

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
    isLoading,
    getPositions,
  }
}

export const useAccountOmnipoolPositionsData = () => {
  const {
    data: omnipoolPositions = [],
    isLoading: isOmnipoolPositionsLoading,
  } = useAccountOmnipoolPositions()
  const {
    data: omnipoolMiningPositions = [],
    isLoading: isOmnipoolMiningPositionsLoading,
  } = useAccountOmnipoolMiningPositions()

  const isPositions =
    omnipoolPositions.length > 0 || omnipoolMiningPositions.length > 0

  const { isLoading: isPositionDataLoading, getData } =
    useOmnipoolPositionData(isPositions)

  const isLoading =
    isOmnipoolPositionsLoading ||
    isOmnipoolMiningPositionsLoading ||
    isPositionDataLoading

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
