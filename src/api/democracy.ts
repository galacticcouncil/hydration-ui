import { ApiPromise } from "@polkadot/api"
import { useQuery } from "@tanstack/react-query"
import { useApiPromise } from "utils/api"
import { QUERY_KEYS } from "utils/queryKeys"

export const useReferendums = (ongoing = true) => {
  const api = useApiPromise()
  return useQuery(QUERY_KEYS.referendums, getReferendums(api), {
    select: (data) =>
      ongoing ? data.filter((r) => r.referendum.isOngoing) : data,
  })
}

export const useReferendumInfo = (referendumIndex: string) => {
  return useQuery(
    QUERY_KEYS.referendumInfo(referendumIndex),
    getReferendumInfo(referendumIndex),
  )
}

export const getReferendumInfo = (referendumIndex: string) => async () => {
  const res = await fetch(
    `https://hydradx.subsquare.io/api/democracy/referendums/${referendumIndex}.json`,
  )

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

export const getReferendums = (api: ApiPromise) => async () => {
  const res = await api.query.democracy.referendumInfoOf.entries()
  const referendums = res.map(([key, codec]) => ({
    id: key.args[0].toString(),
    referendum: codec.unwrap(),
  }))

  return referendums
}

export type Referendum = {
  title: string
  state: string
  lastActivityAt: string
  referendumIndex: number
  motionIndex: number
}
