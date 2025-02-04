import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"

type BifrostAPY = {
  apy: string
  apyBase: string
  apyReward: string
}

export const useBifrostVDotApy = (
  options: UseQueryOptions<BifrostAPY> = {},
) => {
  return useQuery<BifrostAPY>(
    QUERY_KEYS.bifrostVDotApy,
    async () => {
      const res = await fetch("https://dapi.bifrost.io/api/site")
      const data = await res.json()
      return data["vDOT"] as BifrostAPY
    },
    {
      refetchOnWindowFocus: false,
      ...options,
    },
  )
}
