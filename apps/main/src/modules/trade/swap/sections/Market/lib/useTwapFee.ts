import { QUERY_KEY_BLOCK_PREFIX } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"

import { TradeOrder } from "@/api/trade"
import { ENV } from "@/config/env"
import { useEstimateFee } from "@/modules/transactions/hooks/useEstimateFee"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"

export const useTwapFee = (twap: TradeOrder) => {
  const { sdk, featureFlags } = useRpcProvider()
  const { account } = useAccount()
  const {
    swap: {
      split: { twapSlippage, twapMaxRetries },
    },
  } = useTradeSettings()

  // Estimate against the extrinsic that will actually be submitted:
  // a Dca intent under ICE, a DCA schedule otherwise.
  const { data: tx, isLoading: isTxLoading } = useQuery({
    enabled: !!twap,
    queryKey: [
      QUERY_KEY_BLOCK_PREFIX,
      "trade",
      "twapFee",
      twap.type,
      featureFlags.isIceEnabled,
      twapSlippage,
      twapMaxRetries,
    ],
    queryFn: async () => {
      const builder = featureFlags.isIceEnabled
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
    tx ?? null,
  )

  return {
    data,
    isLoading: isTxLoading || isTransactionFeeLoading,
  }
}
