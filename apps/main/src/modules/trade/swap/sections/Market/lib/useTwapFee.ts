import { QUERY_KEY_BLOCK_PREFIX } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"

import { TradeOrder } from "@/api/trade"
import { ENV } from "@/config/env"
import { useEstimateFee } from "@/modules/transactions/hooks/useEstimateFee"
import { useRpcProvider } from "@/providers/rpcProvider"

export const useTwapFee = (twap: TradeOrder) => {
  const { sdk } = useRpcProvider()
  const { account } = useAccount()
  const { data: tx, isLoading: isTxLoading } = useQuery({
    enabled: !!twap,
    queryKey: [QUERY_KEY_BLOCK_PREFIX, "trade", "twapFee", twap.type],
    queryFn: async () => {
      return sdk.tx
        .order(twap)
        .withBeneficiary(account?.address ?? ENV.VITE_TRSRY_ADDR)
        .build()
        .then((tx) => tx.get())
    },
  })

  const { data, isPending: isTransactionFeeLoading } = useEstimateFee(
    tx ?? null,
  )

  return {
    data,
    isLoading: isTxLoading || isTransactionFeeLoading,
  }
}
