import { useQuery } from "@tanstack/react-query"
import { millisecondsInMinute } from "date-fns/constants"
import { useMemo } from "react"
import { z } from "zod"

import { hubToken, omnipoolTokens } from "./pools"

const tvlItemSchema = z.object({
  tvl_usd: z.number(),
  asset_id: z.number(),
})

const feeItemSchema = z.object({
  asset_id: z.number(),
  accrued_fees_usd: z.number(),
  projected_apy_perc: z.number(),
  projected_apr_perc: z.number(),
})

const tvlResponseSchema = z.array(tvlItemSchema)
const feeResponseSchema = z.array(feeItemSchema)

export const useOmnipoolAssetsData = () => {
  const { data: omnipoolTokensData, isLoading: isOmnipoolTokensLoading } =
    useQuery(omnipoolTokens)

  const { data: hubTokenData, isLoading: isHubTokenLoading } =
    useQuery(hubToken)

  const dataMap = useMemo(
    () =>
      omnipoolTokensData
        ? new Map(omnipoolTokensData.map((asset) => [asset.id, asset]))
        : undefined,
    [omnipoolTokensData],
  )

  return {
    data: omnipoolTokensData,
    hubToken: hubTokenData,
    dataMap,
    isLoading: isHubTokenLoading || isOmnipoolTokensLoading,
  }
}

export const useTVL = () =>
  useQuery({
    queryKey: ["omnipool", "tvl"],
    queryFn: () => getTVL(),
    staleTime: millisecondsInMinute,
  })

const getTVL = async () => {
  try {
    const res = await fetch("https://api.hydradx.io/hydradx-ui/v2/stats/tvl")
    const rawData = await res.json()

    return tvlResponseSchema.parse(rawData)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Invalid TVL data:", z.prettifyError(error))
    }
    throw error
  }
}

export const useFee = () =>
  useQuery({
    queryKey: ["omnipool", "fee"],
    queryFn: () => geFee(),
  })

const geFee = async () => {
  try {
    const res = await fetch("https://api.hydradx.io/hydradx-ui/v2/stats/fees")
    const rawData = await res.json()

    return feeResponseSchema.parse(rawData)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Invalid fee data:", z.prettifyError(error))
    }
    throw error
  }
}
