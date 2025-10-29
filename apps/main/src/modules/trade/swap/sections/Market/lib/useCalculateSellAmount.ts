import { useAccount } from "@galacticcouncil/web3-connect"
import { useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"

import { TAssetData } from "@/api/assets"
import { bestBuyQuery, bestBuyTwapQuery } from "@/api/trade"
import { isTwapEnabled } from "@/modules/trade/swap/sections/Market/lib/isTwapEnabled"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"
import { scaleHuman } from "@/utils/formatting"

type Args = {
  readonly sellAsset: TAssetData
  readonly buyAsset: TAssetData
  readonly buyAmount: string
  readonly isSingleTrade: boolean
}

export const useCalculateSellAmount = () => {
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
      buyAmount,
      isSingleTrade,
    }: Args): Promise<string> => {
      if (!buyAmount) {
        return ""
      }

      const { amountIn } = await (async () => {
        const { swap } = await queryClient.ensureQueryData(
          bestBuyQuery(rpc, {
            assetIn: sellAsset.id,
            assetOut: buyAsset.id,
            amountOut: buyAmount,
            slippage: swapSlippage,
            address,
          }),
        )

        if (isSingleTrade) {
          return swap
        }

        const { twap } = await queryClient.ensureQueryData(
          bestBuyTwapQuery(
            rpc,
            {
              assetIn: sellAsset.id,
              assetOut: buyAsset.id,
              amountOut: buyAmount,
              slippage: twapSlippage,
              maxRetries: twapMaxRetries,
              address,
            },
            isTwapEnabled(swap),
          ),
        )

        return twap
      })()

      return scaleHuman(amountIn, sellAsset.decimals) || "0"
    },
    [rpc, swapSlippage, twapSlippage, twapMaxRetries, address, queryClient],
  )
}
