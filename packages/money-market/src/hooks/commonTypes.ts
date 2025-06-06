import { ReserveDataHumanized } from "@aave/contract-helpers"
import {
  ComputedUserReserve,
  formatReservesAndIncentives,
  FormatUserSummaryAndIncentivesResponse,
} from "@aave/math-utils"

export type HookOpts<T, V> = {
  select?: (originalValue: T) => V
  refetchInterval?: number | false | (() => number | false)
  staleTime?: number
}

export type ComputedReserveData = ReturnType<
  typeof formatReservesAndIncentives
>[0] &
  ReserveDataHumanized & {
    iconSymbol: string
    isEmodeEnabled: boolean
    isWrappedBaseAsset: boolean
  }

export type ComputedUserReserveData = ComputedUserReserve<ComputedReserveData>

export type ExtendedFormattedUser =
  FormatUserSummaryAndIncentivesResponse<ComputedReserveData> & {
    loanToValue: string
    earnedAPY: number
    debtAPY: number
    netAPY: number
    isInEmode: boolean
    userEmodeCategoryId: number
  }

export type AssetCapData = {
  percentUsed: number
  isMaxed: boolean
}
