import { ApiPromise } from "@polkadot/api"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { useAccountStore } from "state/store"
import { useRpcProvider } from "providers/rpcProvider"

const REFERENDUM_DATA_URL = import.meta.env.VITE_REFERENDUM_DATA_URL as string

export const useReferendums = (type?: "ongoing" | "finished") => {
  const { api, isLoaded } = useRpcProvider()
  const { account } = useAccountStore()

  return useQuery(
    QUERY_KEYS.referendums(account?.address),
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
