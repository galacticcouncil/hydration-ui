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
  return {
    title: "Test",
    state: "Ongoing",
    lastActivityAt: new Date().toISOString(),
    referendumIndex: 30,
    motionIndex: 57,
  }

  const res = await fetch(
    `https://hydradx.subsquare.io/api/democracy/referendums/${referendumIndex}.json`,
  )
  if (res.ok) {
    const json: Referendum = await res.json()
    return json
  } else return null
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

const isReferendum = (referendum: any): referendum is Referendum => {
  return (
    !!referendum &&
    referendum.referendumIndex !== null &&
    referendum.motionIndex !== null
  )
}
