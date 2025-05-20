import { fixed_from_rational } from "@galacticcouncil/math-liquidity-mining"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { millisecondsInHour } from "date-fns/constants"
import { Binary, Enum } from "polkadot-api"
import { useMemo } from "react"
import { z } from "zod"

import { useRpcProvider } from "@/providers/rpcProvider"
import { scale } from "@/utils/formatting"

import { hubToken, omnipoolTokens } from "./pools"

const feeItemSchema = z.object({
  asset_id: z.number(),
  accrued_fees_usd: z.number(),
  projected_apy_perc: z.number(),
  projected_apr_perc: z.number(),
})

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

export const useMaxAddLiquidityLimit = () => {
  const { papi, isApiLoaded } = useRpcProvider()

  return useQuery({
    staleTime: millisecondsInHour,
    enabled: isApiLoaded,
    queryKey: ["maxAddLiquidityLimit"],
    queryFn: async () => {
      const data =
        await papi.constants.CircuitBreaker.DefaultMaxAddLiquidityLimitPerBlock()

      const [n = 0, d = 0] = data ?? []

      if (!n || !d) return undefined

      const maxAddLiquidity = Big(n).div(d).toString()

      return maxAddLiquidity
    },
  })
}

export const useOmnipoolMinLiquidity = () => {
  const { papi, isApiLoaded } = useRpcProvider()

  return useQuery({
    staleTime: millisecondsInHour,
    enabled: isApiLoaded,
    queryKey: ["omnipoolMinLiquidity"],
    queryFn: async () => {
      const data = await papi.constants.Omnipool.MinimumPoolLiquidity()

      return data
    },
  })
}

export const useMinWithdrawalFee = () => {
  const { papi, isApiLoaded } = useRpcProvider()

  return useQuery({
    staleTime: millisecondsInHour,
    enabled: isApiLoaded,
    queryKey: ["minWithdrawalFee"],
    queryFn: async () => {
      const data = await papi.constants.Omnipool.MinWithdrawalFee()

      return data / 1000000
    },
  })
}

export const useAssetFeeParameters = () => {
  const { papi, isApiLoaded } = useRpcProvider()

  return useQuery({
    staleTime: millisecondsInHour,
    enabled: isApiLoaded,
    queryKey: ["assetFeeParameters"],
    queryFn: async () => {
      const { min_fee, max_fee } =
        await papi.constants.DynamicFees.AssetFeeParameters()

      return {
        minFee: min_fee / 1000000,
        maxFee: max_fee / 1000000,
      }
    },
  })
}

export const useOraclePrice = (
  assetA: number | undefined,
  assetB: number | undefined,
) => {
  const { papi, isLoaded } = useRpcProvider()

  return useQuery({
    staleTime: millisecondsInHour,
    enabled: isLoaded && !!assetA && !!assetB,
    queryKey: ["oracles", assetA, assetB],
    queryFn:
      !!assetA && !!assetB
        ? async () => {
            const orderedAssets = [assetA, assetB].sort((a, b) => a - b) as [
              number,
              number,
            ]

            if (assetA === assetB)
              return {
                id: { assetA, assetB },
                oraclePrice: scale(1, "q"),
              }

            const res = await papi.query.EmaOracle.Oracles.getValue(
              Binary.fromText("omnipool"),
              orderedAssets,
              Enum("TenMinutes"),
            )

            if (res) {
              const { n, d } = res[0].price

              let oraclePrice
              if (assetA < assetB) {
                oraclePrice = fixed_from_rational(n.toString(), d.toString())
              } else {
                oraclePrice = fixed_from_rational(d.toString(), n.toString())
              }

              return {
                id: { assetA, assetB },
                oraclePrice,
              }
            }

            return undefined
          }
        : undefined,
  })
}
