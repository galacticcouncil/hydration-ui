import { fixed_from_rational } from "@galacticcouncil/math-liquidity-mining"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import Big from "big.js"
import { millisecondsInHour } from "date-fns/constants"
import { Binary, Enum } from "polkadot-api"
import { useMemo } from "react"

import { useRpcProvider } from "@/providers/rpcProvider"

import { hubTokenQuery, omnipoolTokensQuery } from "./pools"

type OraclePricePoolType = "omnipool" | "hydraxyk"

export const useOmnipoolAssetsData = () => {
  const { sdk } = useRpcProvider()
  const queryClient = useQueryClient()

  const { data: omnipoolTokensData, isLoading: isOmnipoolTokensLoading } =
    useQuery(omnipoolTokensQuery(sdk, queryClient))

  const { data: hubTokenData, isLoading: isHubTokenLoading } = useQuery(
    hubTokenQuery(sdk, queryClient),
  )

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
  type: OraclePricePoolType = "omnipool",
) => {
  const { papi, isLoaded } = useRpcProvider()

  return useQuery({
    staleTime: millisecondsInHour,
    enabled: isLoaded && !!assetA && !!assetB,
    queryKey: ["oracles", type, assetA, assetB],
    queryFn:
      !!assetA && !!assetB
        ? async () => {
            const orderedAssets = [assetA, assetB].sort((a, b) => a - b) as [
              number,
              number,
            ]

            const res = await papi.query.EmaOracle.Oracles.getValue(
              Binary.fromText(type),
              orderedAssets,
              Enum("TenMinutes"),
            )

            const [data] = res ?? []

            if (data) {
              const { n, d } = data.price

              let oraclePrice
              if (assetA < assetB) {
                oraclePrice = fixed_from_rational(n.toString(), d.toString())
              } else {
                oraclePrice = fixed_from_rational(d.toString(), n.toString())
              }

              return {
                id: { assetA, assetB },
                oraclePrice,
                ...data,
              }
            }

            return null
          }
        : () => null,
  })
}
