import { ApiPromise } from "@polkadot/api"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useRpcProvider } from "providers/rpcProvider"
import { undefinedNoop } from "utils/helpers"

const REFERENDUM_DATA_URL = import.meta.env.VITE_REFERENDUM_DATA_URL as string

export const useReferendums = (type?: "ongoing" | "finished") => {
  const { api, isLoaded } = useRpcProvider()
  const { account } = useAccount()

  return useQuery(
    QUERY_KEYS.referendums(account?.address, type),
    getReferendums(api, account?.address),
    {
      enabled: isLoaded,
      select: (data) =>
        type
          ? data.filter(
              (r) =>
                r.referendum[type === "ongoing" ? "isOngoing" : "isFinished"],
            )
          : data,
    },
  )
}

export const useReferendumInfo = (referendumIndex: string) => {
  return useQuery(
    QUERY_KEYS.referendumInfo(referendumIndex),
    getReferendumInfo(referendumIndex),
  )
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
        amount: vote?.[1].asStandard?.balance.toBigNumber(),
        conviction: vote?.[1].asStandard?.vote.conviction.toString(),
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

export const getReferendumInfoOf = async (api: ApiPromise, id: string) =>
  await api.query.democracy.referendumInfoOf(id)

export const useAccountVotes = () => {
  const { api, isLoaded } = useRpcProvider()
  const { account } = useAccount()

  return useQuery(
    QUERY_KEYS.referendumVotes(account?.address),
    account ? getAccountVotes(api, account.address) : undefinedNoop,
    {
      enabled: isLoaded && !!account,
    },
  )
}

export const getAccountVotes =
  (api: ApiPromise, accountId: string) => async () => {
    const votesRaw = await api.query.democracy.votingOf(accountId)

    if (!votesRaw || votesRaw.isDelegating) return undefined

    const votes = votesRaw.asDirect.votes.map(([id, dataRaw]) => {
      const test = dataRaw.asStandard

      return {
        id: id.toString(),
        balance: test.balance.toBigNumber(),
        conviction: test.vote.conviction.toString(),
      }
    })

    const data = await Promise.all(
      votes.map((vote) => api.query.democracy.referendumInfoOf(vote.id)),
    )

    console.log(data, "data")

    return votes
  }
