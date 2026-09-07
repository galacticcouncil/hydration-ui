import { IndexerSdk } from "@galacticcouncil/indexer/indexer"
import { HDX_SUPPLY_URL } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import { z } from "zod/v4"

import { bestNumberQuery } from "@/api/chain"
import { uniquesIds } from "@/api/constants"
import { TProviderContext } from "@/providers/rpcProvider"

export const stakingRewardsQuery = (
  rpc: TProviderContext,
  address: string,
  openGovReferendaIds: Array<string>,
) => {
  const { queryClient, sdk, isReady } = rpc

  return queryOptions({
    queryKey: ["staking", "rewards", address, openGovReferendaIds],
    queryFn: async () => {
      const blockNumber = await queryClient.ensureQueryData(
        bestNumberQuery(rpc),
      )
      return await sdk.api.staking
        .getRewards(
          address,
          openGovReferendaIds,
          blockNumber.parachainBlockNumber.toString(),
        )
        .then((r) => r ?? null)
    },
    enabled: isReady && !!address,
  })
}

export const StakeQueryKey = ["staking", "stake"]

export const stakeQuery = ({ papi, isReady }: TProviderContext) =>
  queryOptions({
    queryKey: StakeQueryKey,
    queryFn: () => papi.query.Staking.Staking.getValue(),
    enabled: isReady,
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
  rpc: TProviderContext,
  address: string,
) => {
  const { queryClient, isReady, papi } = rpc

  return queryOptions({
    queryKey: StakingPositionsQueryKey(address),
    queryFn: async () => {
      const ids = await queryClient.ensureQueryData(uniquesIds(rpc))
      const uniques = await papi.query.Uniques.Account.getEntries(
        address,
        ids.stakingId,
        { at: "best" },
      )

      const stakePositionId = uniques[0]?.keyArgs[2]

      if (!stakePositionId) {
        return null
      }

      const positions = await rpc.papi.query.Staking.Positions.getValue(
        stakePositionId,
        { at: "best" },
      )

      return {
        stakePositionId,
        ...positions,
      }
    },
    enabled: isReady && !!address,
  })
}

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
  { papi, isReady }: TProviderContext,
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
    enabled: enabled && isReady && !!address,
  })

export const pendingVotesQuery = (
  { papi, isReady }: TProviderContext,
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
    enabled: enabled && isReady,
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

export const potBalanceQuery = ({ sdk, isReady }: TProviderContext) =>
  queryOptions({
    queryKey: ["potBalance"],
    queryFn: () => sdk.api.staking.getPotBalance(),
    enabled: isReady,
  })
