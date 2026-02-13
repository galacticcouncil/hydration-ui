import { useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"

import { TAssetData } from "@/api/assets"
import { bestSellQuery, bestSellTwapQuery } from "@/api/trade"
import { isTwapEnabled } from "@/modules/trade/swap/sections/Market/lib/isTwapEnabled"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scaleHuman } from "@/utils/formatting"

type Args = {
  readonly sellAsset: TAssetData
  readonly buyAsset: TAssetData
  readonly sellAmount: string
  readonly isSingleTrade: boolean
}

export const useCalculateBuyAmount = () => {
  const rpc = useRpcProvider()
  const queryClient = useQueryClient()

  return useCallback(
    async ({
      sellAsset,
      buyAsset,
      sellAmount,
      isSingleTrade,
    }: Args): Promise<string> => {
      if (!sellAmount) {
        return ""
      }

      const { amountOut } = await (async () => {
        const swap = await queryClient.ensureQueryData(
          bestSellQuery(rpc, {
            assetIn: sellAsset.id,
            assetOut: buyAsset.id,
            amountIn: sellAmount,
          }),
        )

        if (isSingleTrade) {
          return swap
        }

        const twap = await queryClient.ensureQueryData(
          bestSellTwapQuery(
            rpc,
            {
              assetIn: sellAsset.id,
              assetOut: buyAsset.id,
              amountIn: sellAmount,
            },
            isTwapEnabled(swap),
          ),
        )

        return twap
      })()

      return scaleHuman(amountOut, buyAsset.decimals) || "0"
    },
    [rpc, queryClient],
  )
}
