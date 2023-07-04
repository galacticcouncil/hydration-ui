import { ApiPromise } from "@polkadot/api"
import { useQuery } from "@tanstack/react-query"
import { useApiPromise } from "utils/api"
import { QUERY_KEYS } from "utils/queryKeys"
import { isApiLoaded } from '../utils/helpers'

const REFERENDUM_DATA_URL = import.meta.env.VITE_REFERENDUM_DATA_URL as string

export const useReferendums = (ongoing = true) => {
  const api = useApiPromise()

  return useQuery(QUERY_KEYS.referendums, getReferendums(api), {
    enabled: !!isApiLoaded(api),
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

export const getReferendums = (api: ApiPromise) => async () => {
  const res = await api.query.democracy.referendumInfoOf.entries()
  const referendums = res.map(([key, codec]) => ({
    id: key.args[0].toString(),
    referendum: codec.unwrap(),
  }))

  return referendums
}

export const getReferendumInfo = (referendumIndex: string) => async () => {
  const res = await fetch(`${REFERENDUM_DATA_URL}/${30}.json`)
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
}
