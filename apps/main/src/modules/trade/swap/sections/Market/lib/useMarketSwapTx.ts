import { Trade } from "@galacticcouncil/sdk-next/build/types/sor"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"

import { TAsset } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountBalances } from "@/states/account"
import { useTradeSettings } from "@/states/tradeSettings"

export const useMarketSwapTxQuery = (
  sellAsset: TAsset | null,
  swap: Trade | undefined,
  key: string[],
) => {
  const { tradeUtils } = useRpcProvider()

  const {
    single: { swapSlippage },
  } = useTradeSettings()
  const { getBalance } = useAccountBalances()

  return useQuery({
    queryKey: ["swapTx", sellAsset?.id, key],
    queryFn: async () => {
      if (!sellAsset || !swap) {
        return null
      }

      const balance = getBalance(sellAsset.id)
      const isMax = Big(swap.amountIn.toString()).gte(
        Big(balance?.free.toString() || "0").minus(5),
      )

      return isMax
        ? tradeUtils.buildSellAllTx(swap, Number(swapSlippage))
        : tradeUtils.buildSellTx(swap, Number(swapSlippage))
    },
    enabled: !!sellAsset && !!swap,
  })
}
