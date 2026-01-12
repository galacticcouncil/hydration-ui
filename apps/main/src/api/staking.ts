import { IndexerSdk } from "@galacticcouncil/indexer/indexer"
import { HDX_SUPPLY_URL } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import { z } from "zod/v4"

import { TProviderContext } from "@/providers/rpcProvider"

export const stakingRewardsQuery = (
  { sdk, isApiLoaded }: TProviderContext,
  address: string,
  openGovReferendaIds: Array<string>,
  blockNumber: number,
) =>
  queryOptions({
    queryKey: ["staking", "rewards", address, openGovReferendaIds, blockNumber],
    queryFn: () =>
      sdk.api.staking
        .getRewards(address, openGovReferendaIds, blockNumber.toString())
        .then((r) => r ?? null),
    enabled: isApiLoaded && !!address && !!blockNumber,
  })

export const StakeQueryKey = ["staking", "stake"]

export const stakeQuery = ({ papi, isApiLoaded }: TProviderContext) =>
  queryOptions({
    queryKey: StakeQueryKey,
    queryFn: () => papi.query.Staking.Staking.getValue(),
    enabled: isApiLoaded,
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

export const HDXSupplyQueryKey = ["hdxSupply"]

export const subscanHDXSupplyQuery = queryOptions({
  queryKey: HDXSupplyQueryKey,
  queryFn: async () => {
    const res = await fetch(HDX_SUPPLY_URL).then((res) => res.json())
    const parsed = hdxSupplySchema.parse(res)

    return parsed.data.detail.HDX
  },
  retry: 0,
})

export const StakingPositionsQueryKey = (address: string) => [
  "staking",
  "positions",
  address,
]

export const stakingPositionsQuery = (
  { isApiLoaded, papi }: TProviderContext,
  address: string,
  stakingCollectionId: bigint,
) =>
  queryOptions({
    queryKey: StakingPositionsQueryKey(address),
    queryFn: async () => {
      const uniques = await papi.query.Uniques.Account.getEntries(
        address,
        stakingCollectionId,
        { at: "best" },
      )

      const stakePositionId = uniques[0]?.keyArgs[2]

      if (!stakePositionId) {
        return null
      }

      const positions = await papi.query.Staking.Positions.getValue(
        stakePositionId,
        { at: "best" },
      )

      return {
        stakePositionId,
        ...positions,
      }
    },
    enabled: isApiLoaded && !!address && !!stakingCollectionId,
  })

export const useInvalidateStakeData = () => {
  const queryClient = useQueryClient()

  const { account } = useAccount()
  const address = account?.address ?? ""

  return useMutation({
    mutationFn: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: StakingPositionsQueryKey(address),
        }),
        queryClient.invalidateQueries({
          queryKey: StakeQueryKey,
        }),
      ])
    },
  })
}

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
  positionId: bigint,
  enabled: boolean,
) =>
  queryOptions({
    queryKey: ["staking", "pendingVotes", positionId.toString()],
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
    enabled: enabled && isApiLoaded,
  })

const stakeEventBase = z.object({
  block: z.object({
    height: z.number(),
  }),
})

const stakeEventInitialized = stakeEventBase.extend({
  name: z.literal("Staking.StakingInitialized"),
})

const stakeEventAccumulatedRps = stakeEventBase.extend({
  name: z.literal("Staking.AccumulatedRpsUpdated"),
  args: z.object({
    accumulatedRps: z.string(),
    totalStake: z.string(),
  }),
})

export type StakeEventAccumulatedRps = z.infer<typeof stakeEventAccumulatedRps>

export const accumulatedRpsUpdatedEventsQuery = (indexerSdk: IndexerSdk) =>
  queryOptions({
    queryKey: ["staking", "events", "accumulatedRps"],
    queryFn: async () => {
      const { events } = await indexerSdk.AccumulatedRpsUpdatedEvents()

      return events.map((event) => stakeEventAccumulatedRps.parse(event))
    },
  })

export const stakingInitializedEventsQuery = (indexerSdk: IndexerSdk) =>
  queryOptions({
    queryKey: ["staking", "events", "initialized"],
    queryFn: async () => {
      const { events } = await indexerSdk.StakingInitializedEvents()

      return events.map((event) => stakeEventInitialized.parse(event))
    },
  })

export const potBalanceQuery = ({ sdk, isApiLoaded }: TProviderContext) =>
  queryOptions({
    queryKey: ["potBalance"],
    queryFn: () => sdk.api.staking.getPotBalance(),
    enabled: isApiLoaded,
  })
