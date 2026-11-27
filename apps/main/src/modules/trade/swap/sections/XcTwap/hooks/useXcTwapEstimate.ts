import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { pick } from "remeda"
import { useShallow } from "zustand/shallow"

import { dcaOrderQuery } from "@/api/trade"
import { useXcIntentsClient } from "@/api/xcIntents"
import {
  xcIntentsDestinationsQuery,
  xcTwapEstimateQuery,
} from "@/api/xcIntents"
import { xcIntentsQueryKeys } from "@/api/xcIntents"
import { getTimeFrameMillis } from "@/components/TimeFrame/TimeFrame.utils"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { DcaOrdersMode } from "@/modules/trade/swap/sections/DCA/useDcaForm"
import { getXcSwapAmountIn } from "@/modules/trade/swap/sections/XcSwap/lib/xcSwapQuoteQuery"
import {
  getXcLeastInAfterSlippage,
  getXcPeriod,
  getXcTranches,
  XC_TWAP_MIN_ORDERS,
} from "@/modules/trade/swap/sections/XcTwap/utils/orders"
import {
  getMinDelivery,
  getPayoutCount,
} from "@/modules/trade/swap/sections/XcTwap/utils/payout"
import { XcTwapFormValues } from "@/modules/trade/swap/sections/XcTwap/XcTwap.form"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"
import { NATIVE_EVM_ASSET_ID } from "@/utils/consts"

type Args = {
  readonly form: UseFormReturn<XcTwapFormValues>
  readonly refundTo: string | null
  /** From the previous estimate; it doesn't depend on the order count */
  readonly leastIn: bigint | null
}

/** The Intent TWAP estimate for the form. */
export const useXcTwapEstimate = ({ form, refundTo, leastIn }: Args) => {
  const rpc = useRpcProvider()
  const client = useXcIntentsClient()
  const { account } = useAccount()
  const { getAsset } = useAssets()
  const {
    dca: { slippage, payoutEvery },
  } = useTradeSettings(useShallow(pick(["dca"])))

  const [sellAsset, sellAmount, destChain, buyAsset, destAddress, duration] =
    form.watch([
      "sellAsset",
      "sellAmount",
      "destChain",
      "buyAsset",
      "destAddress",
      "duration",
    ])
  const orders = form.watch("orders")

  const [debouncedAmount, isAmountSynced] = useDebouncedValue(sellAmount)
  const amountIn = getXcSwapAmountIn(sellAsset, debouncedAmount) ?? 0n
  const durationMs = getTimeFrameMillis(duration)
  const isAuto = orders.type === DcaOrdersMode.Auto

  // Auto: the on-chain DCA's count for selling into WETH, then clamped
  const dcaOrderOptions = dcaOrderQuery(rpc, {
    sellAsset,
    sellAmount: debouncedAmount,
    buyAsset: getAsset(NATIVE_EVM_ASSET_ID) ?? null,
    duration,
    orders: { type: DcaOrdersMode.Auto },
    limitEnabled: false,
    limitPrice: "",
  })
  const { data: dcaOrder, isSuccess: isDcaOrderReady } = useQuery({
    ...dcaOrderOptions,
    enabled: isAuto && dcaOrderOptions.enabled,
  })

  const tranches = isAuto
    ? isDcaOrderReady
      ? Math.max(
          XC_TWAP_MIN_ORDERS,
          getXcTranches({
            mode: DcaOrdersMode.Auto,
            custom: 0,
            // null below the on-chain DCA minimum budget
            suggested: dcaOrder?.tradeCount ?? XC_TWAP_MIN_ORDERS,
            amountIn,
            leastIn: leastIn ?? 0n,
          }),
        )
      : null
    : (orders.value ?? null)

  const recipient = destAddress.trim()
  const destination = buyAsset?.oneClickId ?? ""

  // 0 for NEAR, which has no payout batching
  const { data: destinations } = useQuery(xcIntentsDestinationsQuery(client))
  const routeMin =
    destinations?.find(({ asset }) => asset === destination)?.routeMin ?? 0n

  const isEnabled =
    !!account &&
    !!sellAsset &&
    amountIn > 0n &&
    !!destination &&
    !!destChain?.addressValidator(recipient) &&
    !!refundTo &&
    durationMs > 0 &&
    tranches !== null &&
    tranches >= XC_TWAP_MIN_ORDERS

  const params = {
    account: account?.address ?? "",
    assetIn: Number(sellAsset?.id),
    amountIn,
    destination,
    recipient,
    refundTo: refundTo ?? "",
    tranches: tranches ?? 0,
    period: getXcPeriod(durationMs, tranches || 1),
    slippage,
  }

  // minDelivery comes from the previous estimate's amountOut.
  // The snapshot only moves when another input changes, so a new amountOut
  // from the minDelivery fetch itself doesn't refetch again.
  const paramsKey = xcIntentsQueryKeys.twap(params).join()
  const [previous, setPrevious] = useState<{
    paramsKey: string
    amountOut: bigint
  } | null>(null)
  const previousAmountOut = previous?.amountOut ?? null

  const minDelivery =
    routeMin > 0n && previousAmountOut !== null && tranches !== null
      ? getMinDelivery({
          payoutEvery,
          amountOut: previousAmountOut,
          tranches,
          routeMin,
        })
      : undefined

  const estimateParams = { ...params, minDelivery }
  const estimateQuery = useQuery({
    ...xcTwapEstimateQuery(client, estimateParams),
    enabled: isEnabled,
    // Keep the last estimate (and its leastIn) while the amount or order
    // count moves, but not across a different asset pair
    placeholderData: (previousData, previousQuery) => {
      const [, , previousAssetIn, , previousDestination] =
        previousQuery?.queryKey ?? []

      return previousAssetIn === Number(sellAsset?.id) &&
        previousDestination === destination
        ? previousData
        : undefined
    },
  })

  const settledAmountOut = estimateQuery.isPlaceholderData
    ? undefined
    : estimateQuery.data?.amountOut

  useEffect(() => {
    if (settledAmountOut === undefined) return

    setPrevious((current) =>
      current?.paramsKey === paramsKey
        ? current
        : { paramsKey, amountOut: settledAmountOut },
    )
  }, [paramsKey, settledAmountOut])

  // Another asset pair's amountOut is in other units
  useEffect(() => setPrevious(null), [sellAsset?.id, destination])

  return {
    estimate: isEnabled ? estimateQuery.data : undefined,
    /** What the estimate was asked with; the submit re-fetches it */
    params: isEnabled ? estimateParams : null,
    routeMin,
    minDelivery,
    // Same basis as minDelivery, so "At the end" is 1 payout
    payouts:
      minDelivery !== undefined && previousAmountOut !== null
        ? getPayoutCount(previousAmountOut, minDelivery)
        : 0,
    leastIn: estimateQuery.data
      ? getXcLeastInAfterSlippage(estimateQuery.data.leastIn, slippage)
      : null,
    tranches,
    isLoading:
      isEnabled &&
      (!isAmountSynced ||
        estimateQuery.isLoading ||
        estimateQuery.isPlaceholderData),
    error: isEnabled ? estimateQuery.error : null,
  }
}
