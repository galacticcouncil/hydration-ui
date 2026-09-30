import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { useFormContext } from "react-hook-form"

import { healthFactorQuery } from "@/api/aave"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { LimitFormValues } from "@/modules/trade/swap/sections/Limit/useLimitForm"
import { useRpcProvider } from "@/providers/rpcProvider"

export const useLimitHealthFactor = () => {
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const form = useFormContext<LimitFormValues>()

  const sellAsset = form.watch("sellAsset")
  const [debouncedSellAmount, isSynced] = useDebouncedValue(
    form.watch("sellAmount"),
  )

  const { data: healthFactor, isLoading } = useQuery(
    healthFactorQuery(rpc, {
      fromAsset: sellAsset,
      fromAmount: debouncedSellAmount,
      toAsset: null,
      toAmount: "0",
      address: account?.address ?? "",
    }),
  )

  return { healthFactor, isLoading: isLoading || !isSynced }
}
