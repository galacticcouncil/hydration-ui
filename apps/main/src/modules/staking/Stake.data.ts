import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { TAccountVote } from "@/api/democracy"
import { pendingVotesQuery, processedVotesQuery } from "@/api/staking"
import { useRpcProvider } from "@/providers/rpcProvider"

export type NewVoteId = {
  readonly id: number
  readonly classId: number | undefined
}

type ProcessedVotesData = {
  readonly newProcessedVotes: ReadonlyArray<{
    readonly keyArgs: readonly [unknown, number]
  }>
}

export const getProcessedVoteIds = (
  votes: ReadonlyArray<TAccountVote>,
  data?: ProcessedVotesData,
) => {
  if (!data) {
    return {
      newProcessedVotesIds: [],
    }
  }

  const newProcessedVotesIds = data.newProcessedVotes.map<NewVoteId>(
    ({ keyArgs }) => {
      const [, id] = keyArgs
      const accountVote = votes.find((vote) => vote.id === id)

      return { id, classId: accountVote?.classId }
    },
  )

  return { newProcessedVotesIds }
}

export const useProcessedVotes = (
  votes: ReadonlyArray<TAccountVote>,
  votesSuccess: boolean,
) => {
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const address = account?.address ?? ""

  const { data, isLoading } = useQuery(
    processedVotesQuery(rpc, address, votesSuccess),
  )

  const voteIds = useMemo(() => getProcessedVoteIds(votes, data), [data, votes])

  return {
    ...voteIds,
    isLoading,
  }
}

export const usePendingVotes = (
  positionId: bigint,
  votes: ReadonlyArray<TAccountVote>,
  votesSuccess: boolean,
) => {
  const rpc = useRpcProvider()

  const { data, isLoading } = useQuery(
    pendingVotesQuery(rpc, positionId, votesSuccess),
  )

  const voteIds = useMemo(() => {
    if (!data) {
      return {
        newPendingVotesIds: [],
      }
    }

    const newPendingVotesIds = data.newPendingVotes.map<NewVoteId>(([id]) => {
      const accountVote = votes.find((vote) => vote.id === id)

      return { id, classId: accountVote?.classId }
    })

    return { newPendingVotesIds }
  }, [data, votes])

  return {
    ...voteIds,
    isLoading,
  }
}
