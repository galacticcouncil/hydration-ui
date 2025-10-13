import { useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"

import { TAssetData } from "@/api/assets"
import { bestBuyQuery, bestBuyTwapQuery } from "@/api/trade"
import { isTwapEnabled } from "@/modules/trade/swap/sections/Market/lib/isTwapEnabled"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scaleHuman } from "@/utils/formatting"

type Args = {
  readonly sellAsset: TAssetData
  readonly buyAsset: TAssetData
  readonly buyAmount: string
  readonly isSingleTrade: boolean
}

export const useCalculateSellAmount = () => {
  const rpc = useRpcProvider()
  const queryClient = useQueryClient()

  return useCallback(
    async ({
      sellAsset,
      buyAsset,
      buyAmount,
      isSingleTrade,
    }: Args): Promise<string> => {
      if (!buyAmount) {
        return ""
      }

      const { amountIn } = await (async () => {
        const swap = await queryClient.ensureQueryData(
          bestBuyQuery(rpc, {
            assetIn: sellAsset.id,
            assetOut: buyAsset.id,
            amountOut: buyAmount,
          }),
        )

        if (isSingleTrade) {
          return swap
        }

        return await queryClient.ensureQueryData(
          bestBuyTwapQuery(
            rpc,
            {
              assetIn: sellAsset.id,
              assetOut: buyAsset.id,
              amountOut: buyAmount,
            },
            isTwapEnabled(swap),
          ),
        )
      })()

      return scaleHuman(amountIn, sellAsset.decimals) || "0"
    },
    [rpc, queryClient],
  )
}
