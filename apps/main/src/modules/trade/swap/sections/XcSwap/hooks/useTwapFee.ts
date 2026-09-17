import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"

import { TradeOrder } from "@/api/trade"
import { ENV } from "@/config/env"
import { useEstimateFee } from "@/modules/transactions/hooks/useEstimateFee"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useIsIceEnabled } from "@/states/intents"
import { useTradeSettings } from "@/states/tradeSettings"

export const useTwapFee = (twap: TradeOrder | null, enabled = true) => {
  const { sdk } = useRpcProvider()
  const isIceEnabled = useIsIceEnabled()
  const { account } = useAccount()
  const {
    swap: {
      split: { twapSlippage, twapMaxRetries },
    },
  } = useTradeSettings()

  const { data: tx, isLoading: isTxLoading } = useQuery({
    enabled: !!twap && enabled,
    staleTime: 30_000,
    queryKey: [
      "trade",
      "twapFee",
      twap?.type,
      twap?.amountIn.toString(),
      twap?.amountOut.toString(),
      twap?.tradeCount,
      isIceEnabled,
      twapSlippage,
      twapMaxRetries,
      account?.address,
    ],
    queryFn: async () => {
      if (!twap) throw new Error("TWAP order is required")

      const builder = isIceEnabled
        ? sdk.tx.intentOrder(twap).withSlippage(twapSlippage)
        : sdk.tx
            .order(twap)
            .withSlippage(twapSlippage)
            .withMaxRetries(twapMaxRetries)

      return builder
        .withBeneficiary(account?.address ?? ENV.VITE_TRSRY_ADDR)
        .build()
        .then((tx) => tx.get())
    },
  })

  const { data, isPending: isTransactionFeeLoading } = useEstimateFee(
    enabled ? (tx ?? null) : null,
  )

  return {
    data,
    isLoading: enabled && (isTxLoading || isTransactionFeeLoading),
  }
}
