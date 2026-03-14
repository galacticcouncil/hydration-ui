import { QueryClient, queryOptions } from "@tanstack/react-query"
import Big from "big.js"
import { millisecondsInMinute } from "date-fns/constants"
import { number, string, z } from "zod/v4"

import { bestNumberQuery } from "@/api/chain"
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
  locked1x: 43200,
  locked2x: 86400,
  locked3x: 172800,
  locked4x: 345600,
  locked5x: 691200,
  locked6x: 1382400,
}

/** Substrate encodes Standard vote as one byte: bit 7 = Aye(1)/Nay(0), bits 0-6 = conviction index (0=None..6=Locked6x) */
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

          votes.forEach(([id, data]) => {
            acc.push({
              id,
              classId,
              balance: getVoteAmount(data),
              conviction: getVoteConviction(data),
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

export const openGovUnlockedTokensQuery = (
  rpc: TProviderContext,
  queryClient: QueryClient,
  address: string,
) =>
  queryOptions({
    queryKey: ["openGovUnlockedTokens", address],
    queryFn: async () => {
      const [accountVotes, bestNumber] = await Promise.all([
        queryClient.ensureQueryData(accountOpenGovVotesQuery(rpc, address)),
        queryClient.ensureQueryData(bestNumberQuery(rpc)),
      ])

      if (!bestNumber) {
        throw new Error("Best number not found")
      }

      const currentBlock = bestNumber.parachainBlockNumber

      const votesData = await Promise.all(
        accountVotes.map(async (accountVote) => {
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
            }
          }

          if (referendumInfo.type === "Ongoing") {
            return {
              isUnlocked: false,
              amount: accountVote.balance,
              id: accountVote.id,
              classId: accountVote.classId,
              endDiff: undefined,
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

            return {
              isUnlocked,
              amount: accountVote.balance,
              id: accountVote.id,
              classId: accountVote.classId,
              endDiff: unlockBlockNumber - currentBlock,
            }
          }
        }),
      )

      const unlockedVotes = votesData.reduce<{
        maxUnlockedValue: string
        maxLockedValue: string
        maxLockedBlock: number | undefined
        ids: TUnlockableVote[]
      }>(
        (acc, voteData) => {
          if (voteData.isUnlocked) {
            return {
              maxUnlockedValue: Big.max(
                acc.maxUnlockedValue,
                voteData.amount.toString(),
              ).toString(),
              maxLockedValue: acc.maxLockedValue,
              maxLockedBlock: voteData.endDiff
                ? Big.max(voteData.endDiff, acc.maxLockedBlock ?? 0).toNumber()
                : undefined,
              ids: [
                ...acc.ids,
                { voteId: voteData.id, classId: voteData.classId },
              ],
            }
          }

          return {
            maxLockedValue: Big.max(
              acc.maxLockedValue,
              voteData.amount.toString(),
            ).toString(),
            maxUnlockedValue: acc.maxUnlockedValue,
            maxLockedBlock: Big.max(
              voteData.endDiff ?? 0,
              acc.maxLockedBlock ?? 0,
            ).toNumber(),

            ids: acc.ids,
          }
        },
        {
          maxUnlockedValue: "0",
          maxLockedValue: "0",
          ids: [],
          maxLockedBlock: undefined,
        },
      )

      return unlockedVotes
    },
  })
