import { Trade } from "@galacticcouncil/sdk-next/build/types/sor"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"

import { TAsset } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountBalance } from "@/states/account"
import { useTradeSettings } from "@/states/tradeSettings"
import { QUERY_KEY_BLOCK_PREFIX } from "@/utils/consts"

export const useMarketPartialFeeQuery = (
  swapQueryKey: ReadonlyArray<string>,
  sellAsset: TAsset | null,
  swap: Trade | undefined,
) => {
  const rpc = useRpcProvider()
  const { papi, tradeUtils } = rpc
  const { account } = useAccount()
  const { slippage } = useTradeSettings()

  const balance = useAccountBalance(sellAsset?.id ?? "")
  const isMax = Big(swap?.amountIn.toString() || "0").gte(
    Big(balance?.free.toString() || "0").minus(5),
  )

  return useQuery({
    queryKey: [
      QUERY_KEY_BLOCK_PREFIX,
      "trade",
      "partialFee",
      swapQueryKey,
      slippage,
      account?.address,
    ],
    queryFn: async () => {
      if (!swap) {
        return 0n
      }

      const tx = isMax
        ? await tradeUtils.buildSellAllTx(swap, Number(slippage))
        : await tradeUtils.buildSellTx(swap, Number(slippage))

      const papiTx = await papi.txFromCallData(tx)

      return (await papiTx.getPaymentInfo(account?.address ?? "")).partial_fee
    },
    enabled: !!swap && !!account?.address,
  })
}
