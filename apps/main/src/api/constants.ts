import { queryOptions } from "@tanstack/react-query"
import Big from "big.js"

import { Papi, TProviderContext } from "@/providers/rpcProvider"
import { GC_TIME, STALE_TIME } from "@/utils/consts"

export type ReferendaTrack = Awaited<
  ReturnType<Papi["constants"]["Referenda"]["Tracks"]>
>[number][1]

export const uniquesIds = (context: TProviderContext) => {
  const { isApiLoaded, papi } = context

  return queryOptions({
    enabled: isApiLoaded,
    staleTime: Infinity,
    queryKey: ["uniquesIds"],
    queryFn: async () => {
      const [omnipoolNftId, miningNftId, xykMiningNftId, stakingId] =
        await Promise.all([
          papi.constants.Omnipool.NFTCollectionId(),
          papi.constants.OmnipoolLiquidityMining.NFTCollectionId(),
          papi.constants.XYKLiquidityMining.NFTCollectionId(),
          papi.constants.Staking.NFTCollectionId(),
        ])

      return { omnipoolNftId, miningNftId, xykMiningNftId, stakingId }
    },
  })
}

export const insufficientFeeQuery = ({
  papi,
  isApiLoaded,
}: TProviderContext) => {
  return queryOptions({
    queryKey: ["insufficientFee"],
    queryFn: async () => {
      const fee = await papi.constants.Balances.ExistentialDeposit()

      return new Big(fee.toString()).times(1.1).toString()
    },
    enabled: isApiLoaded,
    gcTime: GC_TIME,
    staleTime: STALE_TIME,
  })
}

export const stakingConstsQuery = ({ papi, isApiLoaded }: TProviderContext) =>
  queryOptions({
    queryKey: ["stakingConsts"],
    queryFn: async () => {
      const [
        palletId,
        minStake,
        periodLength,
        timePointsPerPeriod,
        timePointsWeight,
        stakeWeight,
      ] = await Promise.all([
        papi.constants.Staking.PalletId(),
        papi.constants.Staking.MinStake(),
        papi.constants.Staking.PeriodLength(),
        papi.constants.Staking.TimePointsPerPeriod(),
        papi.constants.Staking.TimePointsWeight(),
        papi.constants.Staking.CurrentStakeWeight(),
      ])

      return {
        palletId,
        minStake,
        periodLength,
        timePointsPerPeriod,
        timePointsWeight,
        stakeWeight: stakeWeight.toString(),
      }
    },
    enabled: isApiLoaded,
    gcTime: GC_TIME,
    staleTime: STALE_TIME,
  })

export const referendaTracksQuery = ({
  isApiLoaded,
  papi,
  dataEnv,
}: TProviderContext) =>
  queryOptions({
    queryKey: ["referendaTracks", dataEnv],
    queryFn: async () => {
      const tracks = await papi.constants.Referenda.Tracks()

      return new Map(tracks.map(([id, track]) => [id, track]))
    },
    enabled: isApiLoaded,
    gcTime: GC_TIME,
    staleTime: STALE_TIME,
  })
