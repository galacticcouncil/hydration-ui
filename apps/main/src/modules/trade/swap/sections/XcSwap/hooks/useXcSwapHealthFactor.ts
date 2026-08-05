import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { useDebounce } from "react-use"

import { healthFactorQuery } from "@/api/aave"
import { XcSwapFormValues } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapForm"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

type UseXcSwapHealthFactorParams = {
  rpc: ReturnType<typeof useRpcProvider>
  form: UseFormReturn<XcSwapFormValues>
  account: ReturnType<typeof useAccount>["account"]
  isCrossChain: boolean
}

export const useXcSwapHealthFactor = ({
  rpc,
  form,
  account,
  isCrossChain,
}: UseXcSwapHealthFactorParams) => {
  const { getAsset } = useAssets()

  const sellAsset = form.watch("sellAsset")
  const buyAsset = form.watch("buyAsset")
  const sellAmount = form.watch("sellAmount")
  const buyAmount = form.watch("buyAmount")

  const [debouncedAmount, setDebouncedAmount] = useState("")
  useDebounce(() => setDebouncedAmount(sellAmount), 200, [sellAmount])

  const [debouncedBuyAmount, setDebouncedBuyAmount] = useState("")
  useDebounce(() => setDebouncedBuyAmount(buyAmount), 200, [buyAmount])

  // OnChain only: resolve the Hydration buy asset (CrossChain has no Aave dest)
  const healthFactorToAsset =
    !isCrossChain && buyAsset?.id !== undefined
      ? (getAsset(String(buyAsset.id)) ?? null)
      : null

  const { data: healthFactor, isLoading: isHealthFactorLoading } = useQuery(
    healthFactorQuery(rpc, {
      fromAsset: sellAsset,
      fromAmount: debouncedAmount,
      toAsset: healthFactorToAsset,
      toAmount: debouncedBuyAmount,
      address: account?.address ?? "",
    }),
  )

  return { healthFactor, isHealthFactorLoading }
}
