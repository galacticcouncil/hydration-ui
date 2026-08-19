import { queryOptions, useQuery } from "@tanstack/react-query"
import z from "zod"

import { GC_TIME, STALE_TIME } from "@/utils/consts"

/**
 * GIGAHDX APR (annual percentage return) — served whole by the public API,
 * which measures both streams from indexed chain data:
 *
 *   totalAPR = baseAPR + votingAPR
 *
 * baseAPR — exchange-rate appreciation; the median of the 7/14/28-day slopes
 * of the gigaHDX rate, floored at the treasury programme's guaranteed rate.
 *
 * votingAPR — realized share of referendum reward pools at max conviction
 * (Locked6x = 8×), from HDX actually paid out over a trailing 60 days.
 */
const GIGA_APR_URL = "https://hydration-api.neckwork.net/v1/staking/gigahdx/apr"

const gigaAprSchema = z.object({
  baseAprPerc: z.string().nullable(),
  votingAprPerc: z.string().nullable(),
  totalAprPerc: z.string().nullable(),
})

export const gigaAprQuery = () =>
  queryOptions({
    queryKey: ["gigaHdxApr"],
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    queryFn: async () => {
      const res = await fetch(GIGA_APR_URL)

      if (!res.ok) {
        throw new Error(`Failed to fetch GIGAHDX APR: ${res.statusText}`)
      }

      return gigaAprSchema.parse(await res.json())
    },
  })

export const useGigaApr = () => {
  const { data, isLoading } = useQuery(gigaAprQuery())

  return {
    base: data?.baseAprPerc,
    voting: data?.votingAprPerc,
    total: data?.totalAprPerc,
    isLoading,
  }
}
