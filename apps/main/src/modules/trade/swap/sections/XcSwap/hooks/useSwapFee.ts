import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"

import { Trade } from "@/api/trade"
import { ENV } from "@/config/env"
import { useEstimateFee } from "@/modules/transactions/hooks/useEstimateFee"
import { useRpcProvider } from "@/providers/rpcProvider"

export const useSwapFee = (swap: Trade | null, enabled = true) => {
  const { sdk } = useRpcProvider()
  const { account } = useAccount()
  const { data: tx, isLoading: isTxLoading } = useQuery({
    enabled: !!swap && enabled,
    staleTime: 30_000,
    queryKey: [
      "trade",
      "swapFee",
      swap?.type,
      swap?.amountIn.toString(),
      swap?.amountOut.toString(),
      account?.address,
    ],

    queryFn: async () => {
      if (!swap) throw new Error("Swap is required")

      return sdk.tx
        .trade(swap)
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
