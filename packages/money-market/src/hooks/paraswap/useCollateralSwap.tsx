import { normalize } from "@aave/math-utils"
import { useCallback, useEffect, useMemo, useState } from "react"

import {
  convertParaswapErrorMessage,
  OptimalRate,
  SwapData,
  SwapTransactionParams,
  UseSwapProps,
} from "@/hooks/paraswap/common"
import { useSwapRateProvider } from "@/hooks/paraswap/useSwapRateProvider"

interface UseSwapResponse {
  outputAmount: string
  outputAmountUSD: string
  inputAmount: string
  inputAmountUSD: string
  priceImpactPct: number
  loading: boolean
  error: string
  buildTxFn: () => Promise<SwapTransactionParams>
  submitTxFn: () => Promise<void>
}

export const useCollateralSwap = ({
  chainId,
  max,
  maxSlippage,
  swapIn,
  swapOut,
  userAddress,
  skip,
}: UseSwapProps): UseSwapResponse => {
  const { fetchExactInRate, fetchExactInTxParams, submitCollateralSwap } =
    useSwapRateProvider()

  const [inputAmount, setInputAmount] = useState<string>("0")
  const [inputAmountUSD, setInputAmountUSD] = useState<string>("0")
  const [outputAmount, setOutputAmount] = useState<string>("0")
  const [outputAmountUSD, setOutputAmountUSD] = useState<string>("0")
  const [priceImpactPct, setPriceImpactPct] = useState(0)
  const [route, setRoute] = useState<OptimalRate>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const swapInData = useMemo(() => {
    const swapData: SwapData = {
      underlyingAsset: swapIn.underlyingAsset,
      decimals: swapIn.decimals,
      supplyAPY: swapIn.supplyAPY,
      amount: swapIn.amount,
      variableBorrowAPY: swapIn.variableBorrowAPY,
    }
    return swapData
  }, [
    swapIn.amount,
    swapIn.decimals,
    swapIn.supplyAPY,
    swapIn.underlyingAsset,
    swapIn.variableBorrowAPY,
  ])

  const swapOutData = useMemo(() => {
    const swapData: SwapData = {
      underlyingAsset: swapOut.underlyingAsset,
      decimals: swapOut.decimals,
      supplyAPY: swapOut.supplyAPY,
      amount: swapOut.amount,
      variableBorrowAPY: swapOut.variableBorrowAPY,
    }
    return swapData
  }, [
    swapOut.amount,
    swapOut.decimals,
    swapOut.supplyAPY,
    swapOut.underlyingAsset,
    swapOut.variableBorrowAPY,
  ])

  const exactInRate = useCallback(() => {
    return fetchExactInRate(swapInData, swapOutData, chainId, userAddress, max)
  }, [fetchExactInRate, chainId, swapInData, swapOutData, userAddress, max])

  useEffect(() => {
    if (skip) return

    const fetchRoute = async () => {
      if (
        !swapInData.underlyingAsset ||
        !swapOutData.underlyingAsset ||
        !swapInData.amount ||
        swapInData.amount === "0" ||
        isNaN(+swapInData.amount)
      ) {
        setInputAmount("0")
        setOutputAmount("0")
        setOutputAmountUSD("0")
        setInputAmountUSD("0")
        setPriceImpactPct(0)
        setRoute(undefined)
        return
      }

      setLoading(true)

      try {
        const route = await exactInRate()
        setError("")
        setRoute(route)
        setInputAmount(normalize(route.srcAmount, route.srcDecimals))
        setInputAmountUSD(route.srcUSD)
        setOutputAmount(normalize(route.destAmount, route.destDecimals))
        setOutputAmountUSD(route.destUSD)
        setPriceImpactPct(route.priceImpactPct)
      } catch (e) {
        console.error(e)
        const message =
          convertParaswapErrorMessage((e as Error).message) ||
          "There was an issue fetching the swap rate"
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    // Update the transaction on any dependency change
    const timeout = setTimeout(() => {
      fetchRoute()
    }, 400)

    return () => {
      clearTimeout(timeout)
    }
  }, [
    error,
    skip,
    swapInData.underlyingAsset,
    swapOutData.underlyingAsset,
    swapInData.amount,
    exactInRate,
    maxSlippage,
    userAddress,
    max,
  ])

  return {
    outputAmount,
    outputAmountUSD,
    inputAmount,
    inputAmountUSD,
    priceImpactPct,
    loading,
    error,
    // Used for calling paraswap buildTx as very last step in transaction
    buildTxFn: async () => {
      if (!route) throw new Error("Route required to build transaction")
      return fetchExactInTxParams(
        route,
        swapIn,
        swapOut,
        chainId,
        userAddress,
        maxSlippage,
      )
    },
    // Native Hydration collateral swap: builds AND submits the router trade
    // (aToken -> aToken) via the injected provider's `submitCollateralSwap`.
    submitTxFn: async () => {
      if (!route) throw new Error("Route required to build transaction")
      return submitCollateralSwap(
        route,
        swapIn,
        swapOut,
        chainId,
        userAddress,
        maxSlippage,
      )
    },
  }
}
