import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import { millisecondsInHour } from "date-fns"
import { QUERY_KEYS } from "utils/queryKeys"

export const fetchBifrostVDotApy = async (): Promise<number> => {
  const res = await fetch("https://dapi.bifrost.io/api/site")
  const data = await res.json()
  const apy = Number(data["vDOT"]?.apy)
  return apy || 0
}

export const vdotApyQuery: UseQueryOptions<number> = {
  queryKey: QUERY_KEYS.bifrostVDotApy,
  queryFn: fetchBifrostVDotApy,
  staleTime: millisecondsInHour,
  refetchOnWindowFocus: false,
}

export const useBifrostVDotApy = (options: UseQueryOptions<number> = {}) => {
  return useQuery({
    ...vdotApyQuery,
    ...options,
  })
}
