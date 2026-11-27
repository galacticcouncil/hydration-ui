import { useAccount } from "@galacticcouncil/web3-connect"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { Trade } from "@/api/trade"
import { ENV } from "@/config/env"
import { getIceSwapAmounts } from "@/modules/trade/swap/sections/XcSwap/lib/iceAmounts"
import { useEstimateFee } from "@/modules/transactions/hooks/useEstimateFee"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"

export const useSwapFee = (swap: Trade | null, enabled = true) => {
  const { sdk } = useRpcProvider()
  const { account } = useAccount()
  const {
    swap: {
      single: { swapSlippage },
    },
  } = useTradeSettings()

  const { data: tx, isLoading: isTxLoading } = useQuery({
    enabled: !!swap && enabled,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
    queryKey: [
      "trade",
      "swapFee",
      swapSlippage,
      swap?.type,
      swap?.amountIn.toString(),
      swap?.amountOut.toString(),
      account?.address,
    ],

    queryFn: async () => {
      if (!swap) throw new Error("Swap is required")

      const beneficiary = account?.address || ENV.VITE_TRSRY_ADDR

      // Estimate the same extrinsic useSubmitSwap submits
      const { amountIn, amountOut } = getIceSwapAmounts(swap, swapSlippage)

      return sdk.tx
        .intentLimit({ ...swap, amountIn })
        .withBeneficiary(beneficiary)
        .withMinAmountOut(amountOut)
        .withPartial(false)
        .build()
        .then((tx) => tx.get())
    },
  })

  const { data, isLoading: isTransactionFeeLoading } = useEstimateFee(
    enabled ? (tx ?? null) : null,
  )

  return {
    data,
    isLoading: enabled && (isTxLoading || isTransactionFeeLoading),
  }
}
