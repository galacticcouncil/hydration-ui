import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { TAccountVote } from "@/api/democracy"
import { pendingVotesQuery, processedVotesQuery } from "@/api/staking"
import { useRpcProvider } from "@/providers/rpcProvider"

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

  const voteIds = useMemo(() => {
    if (!data) {
      return {
        newProcessedVotesIds: [],
        oldProcessedVotesIds: [],
      }
    }

    const newProcessedVotesIds = data.newProcessedVotes.map(({ keyArgs }) => {
      const [, id] = keyArgs
      const accountVote = votes.find((vote) => vote.id === id)

      return { id, classId: accountVote?.classId }
    })

    const oldProcessedVotesIds = data.oldProcessedVotes.map(
      ({ keyArgs }) => keyArgs[1],
    )

    return {
      newProcessedVotesIds,
      oldProcessedVotesIds,
    }
  }, [data, votes])

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
        oldPendingVotesIds: [],
      }
    }

    const newPendingVotesIds = data.newPendingVotes.map(([id]) => {
      const accountVote = votes.find((vote) => vote.id === id)

      return { id, classId: accountVote?.classId }
    })

    const oldPendingVotesIds = data.oldPendingVotes.map(
      ([position]) => position,
    )

    return { newPendingVotesIds, oldPendingVotesIds }
  }, [data, votes])

  return {
    ...voteIds,
    isLoading,
  }
}
