import { queryOptions } from "@tanstack/react-query"
import { z } from "zod/v4"

import { TProviderContext } from "@/providers/rpcProvider"

export const stakingRewardsQuery = (
  { sdk, isApiLoaded }: TProviderContext,
  address: string,
  blockNumber: number,
) =>
  queryOptions({
    queryKey: ["staking", "rewards", address, blockNumber],
    queryFn: () => sdk.api.staking.getRewards(address, blockNumber.toString()),
    enabled: isApiLoaded && !!address && !!blockNumber,
  })

export const stakeQuery = (
  { papi, isApiLoaded }: TProviderContext,
  address: string,
) =>
  queryOptions({
    queryKey: ["staking", "stake"],
    queryFn: () => papi.query.Staking.Staking.getValue(),
    enabled: isApiLoaded && !!address,
  })

const hdxSupplySchema = z.object({
  data: z.object({
    detail: z.object({
      HDX: z.object({
        available_balance: z.string(),
      }),
    }),
  }),
})

export const subscanHDXSupplyQuery = queryOptions({
  queryKey: ["hdxSupply"],
  queryFn: async () => {
    const res = await fetch(
      "https://hydration.api.subscan.io/api/scan/token",
    ).then((res) => res.json())

    const parsed = hdxSupplySchema.parse(res)

    return parsed.data.detail.HDX
  },
  retry: 0,
})

export const stakingPositionsQuery = (
  { isApiLoaded, papi }: TProviderContext,
  address: string,
  stakingCollectionId: bigint,
) =>
  queryOptions({
    queryKey: ["staking", "positions", address, stakingCollectionId.toString()],
    queryFn: async () => {
      const accounts = await papi.query.Uniques.Account.getEntries(
        address,
        stakingCollectionId,
      )

      const stakePositionId = accounts[0]?.keyArgs[2]

      if (!stakePositionId) {
        return null
      }

      const positions =
        await papi.query.Staking.Positions.getValue(stakePositionId)

      return {
        stakePositionId,
        ...positions,
      }
    },
    enabled: isApiLoaded && !!address && !!stakingCollectionId,
  })

export const processedVotesQuery = (
  { papi, isApiLoaded }: TProviderContext,
  address: string,
  enabled: boolean,
) =>
  queryOptions({
    queryKey: ["staking", "processedVotes", address],
    queryFn: async () => {
      const [newProcessedVotes, oldProcessedVotes] = await Promise.all([
        papi.query.Staking.VotesRewarded.getEntries(address),
        papi.query.Staking.ProcessedVotes.getEntries(address),
      ])

      return {
        newProcessedVotes,
        oldProcessedVotes,
      }
    },
    enabled: enabled && isApiLoaded && !!address,
  })

export const pendingVotesQuery = (
  { papi, isApiLoaded }: TProviderContext,
  address: string,
  positionId: bigint,
  enabled: boolean,
) =>
  queryOptions({
    queryKey: ["staking", "pendingVotes", address],
    queryFn: async () => {
      const [newPendingVotes, oldPendingVotes] = await Promise.all([
        papi.query.Staking.Votes.getValue(positionId),
        papi.query.Staking.PositionVotes.getValue(positionId),
      ])

      return {
        newPendingVotes,
        oldPendingVotes,
      }
    },
    enabled: enabled && isApiLoaded && !!address,
  })

export const minStake = ({ isApiLoaded, papi }: TProviderContext) =>
  queryOptions({
    queryKey: ["staking", "minStake"],
    queryFn: () => papi.constants.Staking.MinStake(),
    enabled: isApiLoaded,
  })
