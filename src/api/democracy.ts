import { ApiPromise } from "@polkadot/api"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useRpcProvider } from "providers/rpcProvider"
import { undefinedNoop } from "utils/helpers"
import {
  PalletDemocracyVoteAccountVote,
  PalletReferendaReferendumStatus,
  PalletReferendaCurve,
  PalletConvictionVotingVoteAccountVote,
} from "@polkadot/types/lookup"
import BN, { BigNumber } from "bignumber.js"
import { BN_0 } from "utils/constants"
import { humanizeUnderscoredString } from "utils/formatting"
import { useActiveRpcUrlList } from "./provider"
import { millisecondsInMinute } from "date-fns"

const REFERENDUM_DATA_URL = import.meta.env.VITE_REFERENDUM_DATA_URL as string

const CONVICTIONS_BLOCKS: { [key: string]: number } = {
  none: 0,
  locked1x: 43200,
  locked2x: 86400,
  locked3x: 172800,
  locked4x: 345600,
  locked5x: 691200,
  locked6x: 1382400,
}

const getVoteAmount = (vote: PalletConvictionVotingVoteAccountVote) => {
  if (vote.isSplit) {
    return vote.asSplit.aye
      .toBigNumber()
      .plus(vote.asSplit.nay.toString())
      .toString()
  } else if (vote.isStandard) {
    return vote.asStandard.balance.toString()
  } else if (vote.asSplitAbstain) {
    return vote.asSplit.aye
      .toBigNumber()
      .plus(vote.asSplit.nay.toString())
      .plus(vote.asSplitAbstain.abstain.toString())
      .toString()
  } else {
    return "0"
  }
}

const getVoteConviction = (vote: PalletConvictionVotingVoteAccountVote) => {
  if (vote.isStandard) {
    return vote.asStandard?.vote.conviction.toString()
  } else {
    return "None"
  }
}

const voteConviction = (vote?: PalletDemocracyVoteAccountVote) => {
  if (vote?.isStandard) {
    return vote.asStandard?.vote.conviction.toString()
  } else {
    return "None"
  }
}

const voteAmount = (vote?: PalletDemocracyVoteAccountVote) => {
  if (vote?.isSplit) {
    return vote.asSplit.aye.toBigNumber().plus(vote.asSplit.nay.toBigNumber())
  } else if (vote?.isStandard) {
    return vote.asStandard.balance.toBigNumber()
  } else {
    return BN_0
  }
}

export const useReferendumInfo = (referendumIndex: string) => {
  return useQuery(
    QUERY_KEYS.referendumInfo(referendumIndex),
    getReferendumInfo(referendumIndex),
  )
}

export const useOpenGovReferendas = () => {
  const rpcUrlList = useActiveRpcUrlList()
  const { api, isLoaded } = useRpcProvider()

  return useQuery(
    QUERY_KEYS.openGovReferendas(rpcUrlList.join(".")),
    getOpenGovRegerendas(api),
    {
      enabled: isLoaded,
    },
  )
}

const getOpenGovRegerendas = (api: ApiPromise) => async () => {
  const newReferendumsRaw =
    await api.query.referenda.referendumInfoFor.entries()

  // get only ongoing referenas so far
  return newReferendumsRaw.reduce<
    Array<{ id: string; referendum: PalletReferendaReferendumStatus }>
  >((acc, [key, dataRaw]) => {
    const id = key.args[0].toString()
    const data = dataRaw.unwrap()

    if (!data.isNone && data.isOngoing) {
      acc.push({ id, referendum: data.asOngoing })
    }

    return acc
  }, [])
}

export const getReferendums =
  (api: ApiPromise, accountId?: string) => async () => {
    const [referendumRaw, votesRaw] = await Promise.all([
      api.query.democracy.referendumInfoOf.entries(),
      accountId ? api.query.democracy.votingOf(accountId) : undefined,
    ])

    const isDelegating = votesRaw?.isDelegating

    const referendums = referendumRaw.map(([key, codec]) => {
      const id = key.args[0].toString()

      const vote = !isDelegating
        ? votesRaw?.asDirect.votes.find((vote) => vote[0].toString() === id)
        : undefined

      return {
        id: key.args[0].toString(),
        referendum: codec.unwrap(),
        voted: !!vote,
        amount: voteAmount(vote?.[1]),
        conviction: voteConviction(vote?.[1]),
        isDelegating,
      }
    })

    return referendums
  }

export const getReferendumInfo = (referendumIndex: string) => async () => {
  const res = await fetch(`${REFERENDUM_DATA_URL}/${referendumIndex}.json`)
  if (!res.ok) return null

  const json: Referendum = await res.json()

  if (
    json === null ||
    json.referendumIndex === null ||
    json.motionIndex === null ||
    json.title === null
  )
    return null

  return json
}

export type Referendum = {
  title: string
  state: string
  lastActivityAt: string
  referendumIndex: number
  motionIndex: number
  onchainData: {
    meta: {
      end: number
    }
  }
}

export type TAccountVote = {
  balance: string
  conviction: string
  id: string
  classId: string
}

export const getReferendumInfoOf = async (api: ApiPromise, id: string) =>
  await api.query.democracy.referendumInfoOf(id)

export const useAccountOpenGovVotes = () => {
  const { api, isLoaded } = useRpcProvider()
  const { account } = useAccount()

  return useQuery(
    QUERY_KEYS.accountOpenGovVotes(account?.address),
    account
      ? async () => {
          const votes = await api.query.convictionVoting.votingFor.entries(
            account.address,
          )

          const filteredVotes = votes.reduce<Array<TAccountVote>>(
            (acc, voteClass) => {
              if (voteClass[1].isCasting) {
                const votes = voteClass[1].asCasting.votes
                const classId = voteClass[0].args[1].toString()

                votes.forEach(([id, data]) => {
                  acc.push({
                    id: id.toString(),
                    balance: getVoteAmount(data),
                    conviction: getVoteConviction(data),
                    classId,
                  })
                })
              }

              return acc
            },
            [],
          )

          return filteredVotes
        }
      : undefinedNoop,
    {
      enabled: isLoaded && !!account,
      refetchInterval: millisecondsInMinute,
    },
  )
}

export const useAccountVotes = () => {
  const { api, isLoaded } = useRpcProvider()
  const { account } = useAccount()

  return useQuery(
    QUERY_KEYS.referendumVotes(account?.address),
    account ? getAccountUnlockedVotes(api, account.address) : undefinedNoop,
    {
      enabled: isLoaded && !!account,
    },
  )
}

export const getAccountUnlockedVotes =
  (api: ApiPromise, accountId: string) => async () => {
    const [votesRaw, currentBlock] = await Promise.all([
      api.query.democracy.votingOf(accountId),
      api.derive.chain.bestNumber(),
    ])

    if (!votesRaw || votesRaw.isDelegating) return undefined

    const votes = votesRaw.asDirect.votes.map(([id, dataRaw]) => {
      return {
        id: id.toString(),
        balance: voteAmount(dataRaw),
        conviction: voteConviction(dataRaw),
      }
    })

    const votedAmounts = await Promise.all(
      votes.map(async (vote) => {
        const voteId = vote.id
        const referendumRaw = await api.query.democracy.referendumInfoOf(voteId)

        if (!referendumRaw.isNone) {
          const referendum = referendumRaw.unwrap()
          const isFinished = referendum.isFinished

          const endBlock = isFinished
            ? referendum.asFinished.end.toBigNumber()
            : referendum.asOngoing.end.toBigNumber()
          const convictionBlock =
            CONVICTIONS_BLOCKS[vote.conviction.toLocaleLowerCase()]
          const unlockBlockNumber = endBlock.plus(convictionBlock)
          const isUnlocked = isFinished
            ? unlockBlockNumber.lte(currentBlock.toNumber())
            : false

          return {
            isUnlocked,
            amount: vote.balance,
            id: voteId,
            endDiff: unlockBlockNumber.minus(currentBlock.toNumber()),
          }
        }

        return {
          isUnlocked: true,
          amount: vote.balance,
          id: voteId,
          endDiff: BN_0,
        }
      }),
    )

    const unlockedVotes = votedAmounts.reduce<{
      maxUnlockedValue: BN
      maxLockedValue: BN
      maxLockedBlock: BN
      ids: string[]
    }>(
      (acc, votedAmount) => {
        if (votedAmount.isUnlocked)
          return {
            maxUnlockedValue: BN.maximum(
              acc.maxUnlockedValue,
              votedAmount.amount,
            ),
            maxLockedValue: acc.maxLockedValue,
            maxLockedBlock: BN.maximum(votedAmount.endDiff, acc.maxLockedBlock),
            ids: [...acc.ids, votedAmount.id],
          }

        return {
          maxLockedValue: BN.maximum(acc.maxLockedValue, votedAmount.amount),
          maxUnlockedValue: acc.maxUnlockedValue,
          maxLockedBlock: BN.maximum(votedAmount.endDiff, acc.maxLockedBlock),
          ids: acc.ids,
        }
      },
      {
        maxUnlockedValue: BN_0,
        maxLockedValue: BN_0,
        ids: [],
        maxLockedBlock: BN_0,
      },
    )

    return unlockedVotes
  }

export const useReferendaTracks = () => {
  const rpcUrlList = useActiveRpcUrlList()
  const { api, isLoaded } = useRpcProvider()

  return useQuery(
    QUERY_KEYS.referendaTracks(rpcUrlList.join(".")),
    async () => {
      const tracks = await api.consts.referenda.tracks

      const data: Map<string, TReferenda> = new Map(
        tracks.map(([key, dataRaw]) => [
          key.toString(),
          {
            name: dataRaw.name.toString(),
            nameHuman: humanizeUnderscoredString(dataRaw.name.toString()),
            maxDeciding: dataRaw.maxDeciding.toBigNumber(),
            decisionDeposit: dataRaw.decisionDeposit.toBigNumber(),
            preparePeriod: dataRaw.preparePeriod.toBigNumber(),
            decisionPeriod: dataRaw.decisionPeriod.toBigNumber(),
            confirmPeriod: dataRaw.confirmPeriod.toBigNumber(),
            minEnactmentPeriod: dataRaw.minEnactmentPeriod.toBigNumber(),
            minApproval: dataRaw.minApproval,
            minSupport: dataRaw.minSupport,
          },
        ]),
      )

      return data
    },
    {
      enabled: isLoaded,
    },
  )
}

export type TReferenda = {
  name: string
  nameHuman: string
  maxDeciding: BigNumber
  decisionDeposit: BigNumber
  preparePeriod: BigNumber
  decisionPeriod: BigNumber
  confirmPeriod: BigNumber
  minEnactmentPeriod: BigNumber
  minApproval: PalletReferendaCurve
  minSupport: PalletReferendaCurve
}
