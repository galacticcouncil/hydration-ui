import { QUERY_KEY_BLOCK_PREFIX } from "@galacticcouncil/utils"
import { queryOptions } from "@tanstack/react-query"
import Big from "big.js"
import { millisecondsInMinute } from "date-fns/constants"
import { number, string, z } from "zod/v4"

import { Papi, TProviderContext } from "@/providers/rpcProvider"
import { NATIVE_ASSET_DECIMALS } from "@/utils/consts"
import { scaleHuman } from "@/utils/formatting"

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

const CONVICTIONS_BLOCKS: { [key: string]: number } = {
  none: 0,
  locked1x: 43200,
  locked2x: 86400,
  locked3x: 172800,
  locked4x: 345600,
  locked5x: 691200,
  locked6x: 1382400,
}

export const accountVotesQuery = (
  { papi, isApiLoaded }: TProviderContext,
  address: string,
  currentBlock: number,
) => {
  return queryOptions({
    queryKey: [QUERY_KEY_BLOCK_PREFIX, "democracy", "votes", address],
    queryFn: async () => {
      const votesRaw = await papi.query.Democracy.VotingOf.getValue(address)

      if (!votesRaw || votesRaw.type === "Delegating") {
        return undefined
      }

      const votes = votesRaw.value.votes.map(([id, vote]) => {
        const voteConviction = (): string => {
          if (vote.type === "Standard") {
            // TODO where is vote.conviction?
            // return vote.asStandard?.vote.conviction.toString()
            return vote.value.vote.toString()
          } else {
            return "None"
          }
        }

        const voteAmount = (): bigint => {
          if (vote.type === "Split") {
            return vote.value.aye + vote.value.nay
          } else if (vote.type === "Standard") {
            return vote.value.balance
          } else {
            return 0n
          }
        }

        return {
          id,
          balance: voteAmount(),
          conviction: voteConviction(),
        }
      })

      const votedAmounts = await Promise.all(
        votes.map(async (vote) => {
          const voteId = vote.id
          const referendum =
            await papi.query.Democracy.ReferendumInfoOf.getValue(voteId)

          if (!referendum) {
            return {
              isUnlocked: true,
              amount: scaleHuman(vote.balance, NATIVE_ASSET_DECIMALS),
              id: voteId,
              endDiff: 0,
            }
          }

          const isFinished = referendum.type == "Finished"
          const endBlock = referendum.value.end

          const convictionBlock =
            CONVICTIONS_BLOCKS[vote.conviction.toLocaleLowerCase()] ?? 0

          const unlockBlockNumber = endBlock + convictionBlock
          const isUnlocked = isFinished
            ? unlockBlockNumber <= currentBlock
            : false

          return {
            isUnlocked,
            amount: scaleHuman(vote.balance, NATIVE_ASSET_DECIMALS),
            id: voteId,
            endDiff: unlockBlockNumber - currentBlock,
          }
        }),
      )

      const unlockedVotes = votedAmounts.reduce<{
        maxUnlockedValue: string
        maxLockedValue: string
        maxLockedBlock: number
        ids: ReadonlyArray<number>
      }>(
        (acc, votedAmount) => {
          if (votedAmount.isUnlocked) {
            return {
              maxUnlockedValue: Big.max(
                acc.maxUnlockedValue,
                votedAmount.amount,
              ).toString(),
              maxLockedValue: acc.maxLockedValue,
              maxLockedBlock: Math.max(votedAmount.endDiff, acc.maxLockedBlock),
              ids: [...acc.ids, votedAmount.id],
            }
          }

          return {
            maxLockedValue: Big.max(
              acc.maxLockedValue,
              votedAmount.amount,
            ).toString(),
            maxUnlockedValue: acc.maxUnlockedValue,
            maxLockedBlock: Math.max(votedAmount.endDiff, acc.maxLockedBlock),
            ids: [],
          }
        },
        {
          maxLockedValue: "0",
          maxUnlockedValue: "0",
          maxLockedBlock: 0,
          ids: [],
        },
      )

      return unlockedVotes
    },
    enabled: isApiLoaded && !!address && !!currentBlock,
  })
}

export const govReferendaQuery = ({
  isApiLoaded,
  papi,
  dataEnv,
}: TProviderContext) =>
  queryOptions({
    queryKey: ["govReferenda", dataEnv],
    queryFn: async () => {
      const newReferendums =
        await papi.query.Referenda.ReferendumInfoFor.getEntries()

      return newReferendums.reduce<ReadonlyArray<GovReferendaStatus>>(
        (acc, { keyArgs, value }) => {
          const id = keyArgs[0]

          return [...acc, { id, ...value }]
        },
        [],
      )
    },
    enabled: isApiLoaded,
  })

export type TAccountVote = {
  readonly id: number
  readonly classId: number
}

export const accountOpenGovVotesQuery = (
  { papi, isApiLoaded }: TProviderContext,
  address: string,
) => {
  return queryOptions({
    queryKey: ["accountOpenGovVotes", address],
    queryFn: async () => {
      const votes =
        await papi.query.ConvictionVoting.VotingFor.getEntries(address)

      const filteredVotes = votes.reduce<Array<TAccountVote>>(
        (acc, voteClass) => {
          if (voteClass.value.type !== "Casting") {
            return acc
          }

          const votes = voteClass.value.value.votes
          const classId = voteClass.keyArgs[1]

          votes.forEach(([id]) => {
            acc.push({
              id,
              classId,
            })
          })

          return acc
        },
        [],
      )

      return filteredVotes
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
