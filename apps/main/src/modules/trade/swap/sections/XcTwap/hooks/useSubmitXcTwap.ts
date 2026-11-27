import { withTimeout } from "@galacticcouncil/utils"
import {
  ownerOf,
  TwapParams,
  XcIntentsRequest,
} from "@galacticcouncil/xc-intents"
import { useMutation } from "@tanstack/react-query"
import { useCallback, useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"

import { INTENTS_QUERY_KEY } from "@/api/intents"
import { useXcIntentsClient } from "@/api/xcIntents"
import { xcTwapEstimateQuery, xcTwapOwnerOrdersQuery } from "@/api/xcIntents"
import { xcIntentsQueryKeys } from "@/api/xcIntents"
import { TRADE_ORDERS_QUERY_KEY } from "@/modules/trade/orders/TradeOrders/lib/useChainOrdersData"
import { BUILD_CALL_TIMEOUT_MS } from "@/modules/trade/swap/sections/XcSwap/hooks/useSubmitXcSwap"
import { XcTwapFormValues } from "@/modules/trade/swap/sections/XcTwap/XcTwap.form"
import { AnyTransaction } from "@/modules/transactions/types"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"
import { getErrorMessage } from "@/utils/errors"

// buildCall() throws a plain Error ending in "estimate again" when the relay
// fee rose past the order since the estimate; the SDK has no typed error for it
const isStaleEstimateError = (error: unknown) =>
  error instanceof Error && error.message.endsWith("estimate again")

type XcTwapSubmitVariables = {
  readonly values: XcTwapFormValues
  readonly params: TwapParams
  readonly isCurrent: () => boolean
}

/**
 * Schedules the Intent TWAP. The operation belongs to the
 * estimate params it started with; any change abandons it.
 */
export const useSubmitXcTwap = (params: TwapParams | null) => {
  const { t } = useTranslation(["common", "trade"])
  const { queryClient } = useRpcProvider()
  const client = useXcIntentsClient()
  const { createTransaction } = useTransactionsStore()

  const mutation = useMutation({
    mutationFn: async ({
      values,
      params,
      isCurrent,
    }: XcTwapSubmitVariables) => {
      const { sellAsset, sellAmount, destChain, buyAsset } = values

      if (!sellAsset) throw new Error("Source asset is required")
      if (!destChain) throw new Error("Destination chain is required")
      if (!buyAsset) throw new Error("Destination asset is required")

      let req: XcIntentsRequest
      try {
        const trade = await withTimeout(
          queryClient.fetchQuery(xcTwapEstimateQuery(client, params)),
          BUILD_CALL_TIMEOUT_MS,
        )
        // The refetch lands in the form's estimate, which shows the errors
        if (!isCurrent() || trade.errors.length) return

        // Mints an unfunded 1Click deposit address that never expires
        req = await withTimeout(trade.buildCall(), BUILD_CALL_TIMEOUT_MS)
      } catch (error) {
        if (!isCurrent()) return
        const isTimeout =
          error instanceof Error && error.name === "TimeoutError"
        const isStale = isStaleEstimateError(error)

        // Refetching puts the new fees and order limits in front of the user
        if (isStale) {
          void queryClient.invalidateQueries({
            queryKey: xcTwapEstimateQuery(client, params).queryKey,
          })
        }

        return createTransaction({
          initialError: isTimeout
            ? t("trade:xc.swap.error.routeTimeoutRetry")
            : isStale
              ? t("trade:xc.twap.error.estimateStale")
              : getErrorMessage(error),
          // tx is unused when initialError is set; review modal skips signing.
          tx: {} as AnyTransaction,
        })
      }
      if (!isCurrent()) return
      if (req.kind !== "intent") {
        throw new Error("Expected an ICE intent for a Intent TWAP")
      }

      const i18nVars = {
        amount: sellAmount,
        symbol: sellAsset.symbol,
        dstSymbol: buyAsset.symbol,
        dstChain: destChain.name,
      }

      // "Try again" in the review re-signs this same call: the deposit
      // address never expires and a TWAP has no ICE deadline
      return createTransaction({
        tx: req.tx.get(),
        toasts: {
          submitted: t("trade:xc.twap.toast.submitted", i18nVars),
          success: t("trade:xc.twap.toast.success", i18nVars),
          error: t("trade:xc.twap.toast.error", i18nVars),
        },
        invalidateQueries: [
          INTENTS_QUERY_KEY,
          TRADE_ORDERS_QUERY_KEY,
          xcTwapOwnerOrdersQuery(ownerOf(params.account)).queryKey,
        ],
      })
    },
  })

  const operationRef = useRef(0)
  const { reset } = mutation

  const abandon = useCallback(() => {
    operationRef.current += 1
    reset()
  }, [reset])

  // A late result for other inputs is discarded and the button frees
  const paramsKey = params ? xcIntentsQueryKeys.twap(params).join() : null
  useEffect(() => abandon, [abandon, paramsKey])

  const submit = (values: XcTwapFormValues) => {
    if (!params) return
    const operation = ++operationRef.current
    mutation.mutate({
      values,
      params,
      isCurrent: () => operationRef.current === operation,
    })
  }

  return { submit, isSubmitting: mutation.isPending }
}
