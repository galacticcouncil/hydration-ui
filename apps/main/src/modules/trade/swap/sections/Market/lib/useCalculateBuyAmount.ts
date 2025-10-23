import { useAccount } from "@galacticcouncil/web3-connect"
import { useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"

import { TAssetData } from "@/api/assets"
import { bestSellQuery, bestSellTwapQuery } from "@/api/trade"
import { isTwapEnabled } from "@/modules/trade/swap/sections/Market/lib/isTwapEnabled"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"
import { scaleHuman } from "@/utils/formatting"

type Args = {
  readonly sellAsset: TAssetData
  readonly buyAsset: TAssetData
  readonly sellAmount: string
  readonly isSingleTrade: boolean
}

export const useCalculateBuyAmount = () => {
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const address = account?.address ?? ""

  const queryClient = useQueryClient()

  const {
    swap: {
      single: { swapSlippage },
      split: { twapSlippage, twapMaxRetries },
    },
  } = useTradeSettings()

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
        const { swap } = await queryClient.ensureQueryData(
          bestSellQuery(rpc, {
            assetIn: sellAsset.id,
            assetOut: buyAsset.id,
            amountIn: sellAmount,
            slippage: swapSlippage,
            address,
          }),
        )

        if (isSingleTrade) {
          return swap
        }

        const { twap } = await queryClient.ensureQueryData(
          bestSellTwapQuery(
            rpc,
            {
              assetIn: sellAsset.id,
              assetOut: buyAsset.id,
              amountIn: sellAmount,
              slippage: twapSlippage,
              maxRetries: twapMaxRetries,
              address,
            },
            isTwapEnabled(swap),
          ),
        )

        return twap
      })()

      return scaleHuman(amountOut, buyAsset.decimals) || "0"
    },
    [rpc, swapSlippage, twapSlippage, twapMaxRetries, address, queryClient],
  )
}
