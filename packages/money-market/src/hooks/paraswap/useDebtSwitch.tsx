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

interface UseDebtSwitchResponse {
  outputAmount: string
  outputAmountUSD: string
  inputAmount: string
  inputAmountUSD: string
  priceImpactPct: number
  loading: boolean
  error: string
  buildTxFn: () => Promise<SwapTransactionParams>
}

export const useDebtSwitch = ({
  chainId,
  max,
  maxSlippage,
  skip,
  swapIn,
  swapOut,
  userAddress,
}: UseSwapProps): UseDebtSwitchResponse => {
  const { fetchExactOutRate, fetchExactOutTxParams } = useSwapRateProvider()

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

  const exactOutRate = useCallback(
    () => fetchExactOutRate(swapInData, swapOutData, chainId, userAddress, max),
    [fetchExactOutRate, chainId, max, swapInData, swapOutData, userAddress],
  )

  useEffect(() => {
    if (skip) return

    const fetchRoute = async () => {
      if (
        !swapInData.underlyingAsset ||
        !swapOutData.underlyingAsset ||
        !swapOutData.amount ||
        swapOutData.amount === "0" ||
        isNaN(+swapOutData.amount)
      ) {
        setInputAmount("0")
        setInputAmountUSD("0")
        setOutputAmount("0")
        setOutputAmountUSD("0")
        setRoute(undefined)
        return
      }

      setLoading(true)

      try {
        const route: OptimalRate = await exactOutRate()

        setError("")
        setRoute(route)
        setInputAmount(normalize(route.srcAmount, route.srcDecimals))
        setOutputAmount(normalize(route.destAmount, route.destDecimals))

        setInputAmountUSD(route.srcUSD)
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
    skip,
    swapInData.underlyingAsset,
    swapInData.amount,
    swapOutData.underlyingAsset,
    swapOutData.amount,
    exactOutRate,
    maxSlippage,
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
      return fetchExactOutTxParams(
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
