import { useAccount } from "@galacticcouncil/web3-connect"
import { useQueries } from "@tanstack/react-query"
import { UseFormReturn } from "react-hook-form"

import { healthFactorAfterWithdrawQuery } from "@/api/aave"
import { dcaTradeOrderQuery } from "@/api/trade"
import { getPeriodDuration } from "@/components/PeriodInput/PeriodInput.utils"
import { DcaFormValues } from "@/modules/trade/swap/sections/DCA/useDcaForm"
import { isErc20AToken } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

export const useDcaTradeOrder = (form: UseFormReturn<DcaFormValues>) => {
  const rpc = useRpcProvider()
  const { account } = useAccount()

  const [sellAsset, buyAsset, sellAmount, period] = form.watch([
    "sellAsset",
    "buyAsset",
    "sellAmount",
    "period",
  ])

  const [
    { data: orderData, isLoading: isOrderLoading },
    { data: healthFactorData, isLoading: isHealthFactorLoading },
  ] = useQueries({
    queries: [
      dcaTradeOrderQuery(rpc, {
        assetIn: sellAsset?.id ?? "",
        assetOut: buyAsset?.id ?? "",
        amountIn: sellAmount,
        duration: getPeriodDuration(period),
      }),
      healthFactorAfterWithdrawQuery(rpc, {
        address: account?.address ?? "",
        assetId:
          sellAsset && isErc20AToken(sellAsset)
            ? sellAsset.underlyingAssetId
            : "",
        amount: sellAmount,
      }),
    ],
  })

  return {
    order: orderData,
    healthFactor: healthFactorData,
    isLoading: isOrderLoading || isHealthFactorLoading,
  }
}
