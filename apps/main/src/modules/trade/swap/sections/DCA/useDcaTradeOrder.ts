import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { UseFormReturn } from "react-hook-form"

import { healthFactorQuery } from "@/api/aave"
import { dcaTradeOrderQuery } from "@/api/trade"
import { DcaFormValues } from "@/modules/trade/swap/sections/DCA/useDcaForm"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"
import { toDecimal } from "@/utils/formatting"

export const useDcaTradeOrder = (form: UseFormReturn<DcaFormValues>) => {
  const rpc = useRpcProvider()
  const { getAsset } = useAssets()

  const { account } = useAccount()
  const address = account?.address ?? ""

  const {
    dca: { slippage, maxRetries },
  } = useTradeSettings()

  const formValues = form.watch()

  const { data: orderData, isLoading: isOrderLoading } = useQuery(
    dcaTradeOrderQuery(rpc, {
      form: formValues,
      slippage,
      maxRetries,
      address,
      dryRun: form.formState.isValid,
    }),
  )

  const assetOut = getAsset(orderData?.order?.assetOut ?? 0)

  const { data: healthFactorData, isLoading: isHealthFactorLoading } = useQuery(
    healthFactorQuery(rpc, {
      fromAsset: formValues.sellAsset,
      fromAmount: formValues.sellAmount,
      toAsset: formValues.buyAsset,
      toAmount:
        orderData && assetOut && orderData.order
          ? toDecimal(orderData.order.amountOut, assetOut.decimals)
          : "0",
      address,
    }),
  )

  return {
    order: orderData?.order,
    orderTx: orderData?.orderTx,
    dryRunError: orderData?.dryRunError ?? null,
    healthFactor: healthFactorData,
    isLoading: isOrderLoading || isHealthFactorLoading,
  }
}
