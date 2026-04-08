import { QueryClient, queryOptions } from "@tanstack/react-query"
import Big from "big.js"
import { millisecondsInMinute } from "date-fns/constants"
import { number, string, z } from "zod/v4"

import { bestNumberQuery } from "@/api/chain"
import { accountVotesQuery, SubsquareVoteState } from "@/api/external/subsquare"
import { Papi, TProviderContext } from "@/providers/rpcProvider"

export type CastingVoteInfo = Extract<
  Awaited<
    ReturnType<Papi["query"]["ConvictionVoting"]["VotingFor"]["getEntries"]>
  >[number]["value"],
  { type: "Casting" }
>["value"]

export type ConvictionVotingVoteAccountVote =
  CastingVoteInfo["votes"][number][1]

export type GovReferendaStatus = Awaited<
  ReturnType<Papi["query"]["Referenda"]["ReferendumInfoFor"]["getEntries"]>
>[number]["value"] & {
  readonly id: number
}

export type OngoingGovReferenda = Extract<
  GovReferendaStatus,
  { type: "Ongoing" }
>["value"]

export type TUnlockableVote = {
  voteId: number
  classId: number
}

const CONVICTIONS_BLOCKS: { [key: string]: number } = {
  none: 0,
  locked1x: 100800,
  locked2x: 201600,
  locked3x: 403200,
  locked4x: 806400,
  locked5x: 1612800,
  locked6x: 3225600,
}

const CONVICTIONS_BLOCKS_BY_INDEX: { [key: string]: number } = {
  0: 0,
  1: 100800,
  2: 201600,
  3: 403200,
  4: 806400,
  5: 1612800,
  6: 3225600,
}

const CONVICTION_NAMES = [
  "none",
  "locked1x",
  "locked2x",
  "locked3x",
  "locked4x",
  "locked5x",
  "locked6x",
] as const

export const decodeStandardVote = (packedVote: number) => {
  const aye = (packedVote & 0x80) !== 0
  const index = packedVote & 0x7f
  const conviction =
    (index <= 6 ? CONVICTION_NAMES[index] : CONVICTION_NAMES[0]) ?? "none"
  return { conviction, aye }
}

const getVoteAmount = (vote: ConvictionVotingVoteAccountVote) => {
  if (vote.type === "Split") {
    return vote.value.aye + vote.value.nay
  } else if (vote.type === "Standard") {
    return vote.value.balance
  } else if (vote.type === "SplitAbstain") {
    return vote.value.aye + vote.value.nay + vote.value.abstain
  } else {
    return 0n
  }
}

const getVoteConviction = (vote: ConvictionVotingVoteAccountVote): string => {
  if (vote.type === "Standard") {
    return decodeStandardVote(vote.value.vote).conviction
  }
  return "none"
}

export type OpenGovReferendum = Extract<
  Awaited<
    ReturnType<Papi["query"]["Referenda"]["ReferendumInfoFor"]["getEntries"]>
  >[number]["value"],
  { type: "Ongoing" }
>["value"] & {
  id: number
}

export const openGovReferendaQuery = ({
  papi,
  isApiLoaded,
  dataEnv,
}: TProviderContext) =>
  queryOptions({
    queryKey: ["openGovReferenda", dataEnv],
    enabled: isApiLoaded,
    queryFn: async () => {
      const newReferendums =
        await papi.query.Referenda.ReferendumInfoFor.getEntries()

      return newReferendums.reduce<Array<OpenGovReferendum>>(
        (acc, { keyArgs, value }) => {
          const id = keyArgs[0]

          if (value.type === "Ongoing") {
            acc.push({ id, ...value.value })
          }

          return acc
        },
        [],
      )
    },
  })

export type TAccountVote = {
  readonly id: number
  readonly classId: number
  readonly balance: bigint
  readonly conviction: string
}

type TAccountOpenGovVotesAccumulator = {
  votes: TAccountVote[]
  classIds: Set<number>
}

export const accountOpenGovVotesQuery = (
  { papi, isApiLoaded }: TProviderContext,
  address: string,
) => {
  return queryOptions({
    queryKey: ["accountOpenGovVotes", address],
    queryFn: async () => {
      const voteEntries =
        await papi.query.ConvictionVoting.VotingFor.getEntries(address)

      const { votes, classIds } =
        voteEntries.reduce<TAccountOpenGovVotesAccumulator>(
          (acc, voteClass) => {
            if (voteClass.value.type !== "Casting") {
              return acc
            }

            const votes = voteClass.value.value.votes
            const classId = voteClass.keyArgs[1]

            votes.forEach(([id, data]) => {
              acc.votes.push({
                id,
                classId,
                balance: getVoteAmount(data),
                conviction: getVoteConviction(data),
              })
            })
            acc.classIds.add(classId)

            return acc
          },
          { votes: [], classIds: new Set([]) },
        )

      return { votes, classIds: Array.from(classIds) }
    },
    enabled: isApiLoaded && !!address,
    refetchInterval: millisecondsInMinute,
  })
}

const REFERENDUM_DATA_URL =
  "https://hydration-api.subsquare.io/gov2/referendums"

const referendumSchema = z
  .object({
    title: string().nullable().optional(),
    referendumIndex: number().nullable().optional(),
    motionIndex: number().nullable().optional(),
  })
  .nullable()

export const referendumInfoQuery = (referendumIndex: number) =>
  queryOptions({
    queryKey: ["referendumInfo", referendumIndex],
    queryFn: async () => {
      const res = await fetch(`${REFERENDUM_DATA_URL}/${referendumIndex}.json`)
      if (!res.ok) return null

      const json = await res.json()
      const parsed = referendumSchema.parse(json)

      if (
        !parsed ||
        parsed.referendumIndex === null ||
        parsed.motionIndex === null ||
        parsed.title === null
      )
        return null

      return parsed
    },
  })

export const openGovUnlockedTokensQuery = (
  rpc: TProviderContext,
  queryClient: QueryClient,
  address: string,
) =>
  queryOptions({
    queryKey: ["openGovUnlockedTokens", address],
    queryFn: async () => {
      const [accountVotes, bestNumber, subsquareAccountVotes] =
        await Promise.all([
          queryClient.ensureQueryData(accountOpenGovVotesQuery(rpc, address)),
          queryClient.ensureQueryData(bestNumberQuery(rpc)),
          queryClient.ensureQueryData(accountVotesQuery(address)),
        ])
      if (!bestNumber) {
        throw new Error("Best number not found")
      }

      const currentBlock = bestNumber.parachainBlockNumber

      const filteredVotes = []
      for (const vote of subsquareAccountVotes.items) {
        const status = vote.proposal.state.name
        if (status === SubsquareVoteState.Executed) {
          const convictionBlockNumber =
            CONVICTIONS_BLOCKS_BY_INDEX[vote.conviction]

          if (convictionBlockNumber === undefined) {
            filteredVotes.push({
              amount: BigInt(vote.balance),
              id: vote.referendumIndex,
              locked: true,
              diffBlockNumber: undefined,
            })
            continue
          }

          const unlockBlockNumber =
            vote.proposal.state.indexer.blockHeight + convictionBlockNumber

          const diffBlockNumber = unlockBlockNumber - currentBlock

          filteredVotes.push({
            id: vote.referendumIndex,
            amount: BigInt(vote.balance),
            locked: Big(unlockBlockNumber).gt(currentBlock),
            diffBlockNumber,
          })
          continue
        } else if (
          status === SubsquareVoteState.Ongoing ||
          status === SubsquareVoteState.Deciding ||
          status === SubsquareVoteState.Confirming
        ) {
          filteredVotes.push({
            id: vote.referendumIndex,
            amount: BigInt(vote.balance),
            locked: true,
            diffBlockNumber: undefined,
          })
          continue
        } else {
          continue
        }
      }

      const votesData = await Promise.all(
        accountVotes.votes.map(async (accountVote) => {
          const referendumInfo =
            await rpc.papi.query.Referenda.ReferendumInfoFor.getValue(
              accountVote.id,
            )

          if (!referendumInfo) {
            return {
              isUnlocked: true,
              amount: accountVote.balance,
              id: accountVote.id,
              classId: accountVote.classId,
              endDiff: undefined,
              locked: false,
              diffBlockNumber: undefined,
            }
          }

          if (referendumInfo.type === "Ongoing") {
            return {
              isUnlocked: false,
              amount: accountVote.balance,
              id: accountVote.id,
              classId: accountVote.classId,
              endDiff: undefined,
              locked: true,
              diffBlockNumber: undefined,
            }
          } else {
            const endBlock =
              referendumInfo.type === "Killed"
                ? referendumInfo.value
                : referendumInfo.value[0]
            const convictionBlockNumber =
              CONVICTIONS_BLOCKS[accountVote.conviction]

            if (convictionBlockNumber === undefined) {
              throw new Error("Invalid conviction")
            }

            const unlockBlockNumber = endBlock + convictionBlockNumber
            const isUnlocked = Big(unlockBlockNumber).lte(currentBlock)

            const diffBlockNumber = unlockBlockNumber - currentBlock

            return {
              isUnlocked,
              amount: accountVote.balance,
              id: accountVote.id,
              classId: accountVote.classId,
              endDiff: unlockBlockNumber - currentBlock,
              diffBlockNumber,
              locked: Big(unlockBlockNumber).gt(currentBlock),
            }
          }
        }),
      )

      const votesById = new Map()

      for (const vote of filteredVotes) {
        votesById.set(vote.id, vote)
      }

      for (const vote of votesData) {
        votesById.set(vote.id, vote)
      }

      const mergedVotesMax = [...votesById.values()].reduce<{
        maxLockedValue: string
        maxLockedBlock: number | undefined
        votesToRemove: TUnlockableVote[]
      }>(
        (acc, voteData) => {
          if (!voteData.locked && typeof voteData.classId === "number") {
            acc.votesToRemove.push({
              voteId: voteData.id,
              classId: voteData.classId,
            })
          }

          if (!voteData.locked) return acc

          return {
            maxLockedValue: Big.max(
              acc.maxLockedValue,
              voteData.amount.toString(),
            ).toString(),
            maxLockedBlock:
              voteData.diffBlockNumber !== undefined &&
              acc.maxLockedBlock !== undefined
                ? Big.max(
                    voteData.diffBlockNumber,
                    acc.maxLockedBlock ?? 0,
                  ).toNumber()
                : undefined,
            votesToRemove: acc.votesToRemove,
          }
        },
        {
          maxLockedValue: "0",
          maxLockedBlock: 0,
          votesToRemove: [],
        },
      )

      return { ...mergedVotesMax, classIds: accountVotes.classIds }
    },
  })
