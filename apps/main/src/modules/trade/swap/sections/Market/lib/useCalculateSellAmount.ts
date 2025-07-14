import { useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"

import { TAssetData } from "@/api/assets"
import { bestBuyQuery } from "@/api/trade"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scaleHuman } from "@/utils/formatting"

export const useCalculateSellAmount = () => {
  const rpc = useRpcProvider()
  const queryClient = useQueryClient()

  return useCallback(
    async (
      sellAsset: TAssetData,
      buyAsset: TAssetData,
      buyAmount: string,
    ): Promise<string> => {
      const { amountIn } = await queryClient.ensureQueryData(
        bestBuyQuery(rpc, {
          assetIn: sellAsset.id,
          assetOut: buyAsset.id,
          amountOut: buyAmount,
        }),
      )

      return scaleHuman(amountIn, sellAsset.decimals) || "0"
    },
    [rpc, queryClient],
  )
}
