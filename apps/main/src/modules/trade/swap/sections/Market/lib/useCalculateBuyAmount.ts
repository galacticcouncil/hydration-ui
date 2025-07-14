import { useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"

import { TAssetData } from "@/api/assets"
import { bestSellQuery } from "@/api/trade"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scaleHuman } from "@/utils/formatting"

export const useCalculateBuyAmount = () => {
  const rpc = useRpcProvider()
  const queryClient = useQueryClient()

  return useCallback(
    async (
      sellAsset: TAssetData,
      buyAsset: TAssetData,
      sellAmount: string,
    ): Promise<string> => {
      const { amountOut } = await queryClient.ensureQueryData(
        bestSellQuery(rpc, {
          assetIn: sellAsset.id,
          assetOut: buyAsset.id,
          amountIn: sellAmount,
        }),
      )

      return scaleHuman(amountOut, buyAsset.decimals) || "0"
    },
    [rpc, queryClient],
  )
}
