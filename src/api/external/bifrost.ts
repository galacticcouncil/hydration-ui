import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import { millisecondsInHour } from "date-fns"
import { QUERY_KEYS } from "utils/queryKeys"

type BifrostVDotApy = number

export const fetchBifrostVDotApy = async () => {
  const res = await fetch("https://dapi.bifrost.io/api/site")
  const data = await res.json()
  const apy = Number(data["vDOT"]?.apy)
  return isNaN(apy) ? 0 : apy
}

export const vdotApyQuery: UseQueryOptions<BifrostVDotApy> = {
  queryKey: QUERY_KEYS.bifrostVDotApy,
  queryFn: fetchBifrostVDotApy,
  staleTime: millisecondsInHour,
  refetchOnWindowFocus: false,
}

export const useBifrostVDotApy = (
  options: UseQueryOptions<BifrostVDotApy> = {},
) => {
  return useQuery({
    ...vdotApyQuery,
    ...options,
  })
}
