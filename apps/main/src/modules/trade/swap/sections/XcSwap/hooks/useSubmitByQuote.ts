import { XcSwapClient } from "@galacticcouncil/xc-swap"
import { useCallback, useEffect, useMemo, useRef } from "react"
import { UseFormReturn } from "react-hook-form"

import { useSubmitSwap } from "@/modules/trade/swap/sections/XcSwap/hooks/useSubmitSwap"
import { useSubmitTwap } from "@/modules/trade/swap/sections/XcSwap/hooks/useSubmitTwap"
import { useSubmitXcSwap } from "@/modules/trade/swap/sections/XcSwap/hooks/useSubmitXcSwap"
import { XcSwapFormValues } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapForm"
import {
  resetXcSwapForm,
  shouldResetXcSwapFormAfterSubmit,
} from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapFormReset"
import { XcSwapQuote } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapQuote"
import {
  SwapSubmitValues,
  XcAsset,
} from "@/modules/trade/swap/sections/XcSwap/types"
import { useAssets } from "@/providers/assetsProvider"
import { TransactionActions } from "@/states/transactions"

type SubmitSnapshot = {
  readonly sellAmount: string
  readonly maxSellBalance: string
}

type UseSubmitByQuoteParams = {
  form: UseFormReturn<XcSwapFormValues>
  quote: XcSwapQuote
  maxSwapSellBalance: string
  maxTwapSellBalance: string
  xcSwap: XcSwapClient
  originAssetMap: Map<string, XcAsset>
  refundTo: string | null
  swapSlippage: number
}

export const useSubmitByQuote = ({
  form,
  quote,
  maxSwapSellBalance,
  maxTwapSellBalance,
  xcSwap,
  originAssetMap,
  refundTo,
  swapSlippage,
}: UseSubmitByQuoteParams) => {
  const { getAsset } = useAssets()
  const onSubmitRef = useRef<(() => void) | undefined>(undefined)
  const submitSnapshotRef = useRef<SubmitSnapshot | null>(null)

  const transactionActions = useMemo<TransactionActions>(
    () => ({
      onSubmitted: () => onSubmitRef.current?.(),
    }),
    [],
  )

  const submit = useSubmitXcSwap(
    { xcSwap, originAssetMap, refundTo, swapSlippage },
    transactionActions,
  )
  const submitOmnipool = useSubmitSwap(transactionActions)
  const submitTwap = useSubmitTwap(transactionActions)

  const xcOperationRef = useRef(0)
  const { reset: resetXcSubmit } = submit

  const abandonXcSwap = useCallback(() => {
    xcOperationRef.current += 1
    resetXcSubmit()
  }, [resetXcSubmit])

  const [sellAsset, buyAsset, destChain, destAddress, sellAmount] = form.watch([
    "sellAsset",
    "buyAsset",
    "destChain",
    "destAddress",
    "sellAmount",
  ])
  const sellAssetId = sellAsset?.id
  const buyAssetKey = buyAsset?.key
  const destChainKey = destChain?.key

  // A cross-chain preparation belongs to the swap it started for. Changing the
  // swap (or leaving) abandons it so its late result is discarded and the
  // submit button frees right away.
  useEffect(
    () => abandonXcSwap,
    [
      abandonXcSwap,
      sellAssetId,
      buyAssetKey,
      destChainKey,
      destAddress,
      sellAmount,
    ],
  )

  onSubmitRef.current = () => {
    const snapshot = submitSnapshotRef.current

    if (
      !snapshot ||
      shouldResetXcSwapFormAfterSubmit(
        snapshot.sellAmount,
        snapshot.maxSellBalance,
      )
    ) {
      resetXcSwapForm(form, { clearDestAddress: true })
    }

    submitSnapshotRef.current = null
    submit.reset()
    submitOmnipool.reset()
    submitTwap.reset()
  }

  const toSwapSubmitValues = (values: XcSwapFormValues): SwapSubmitValues => ({
    sellAsset: values.sellAsset,
    sellAmount: values.sellAmount,
    buyAsset:
      values.buyAsset?.id !== undefined
        ? (getAsset(String(values.buyAsset.id)) ?? null)
        : null,
    buyAmount: values.buyAmount,
    type: values.type,
    isSingleTrade: values.isSingleTrade,
  })

  const onSubmit = (values: XcSwapFormValues) => {
    submitSnapshotRef.current = {
      sellAmount: values.sellAmount,
      maxSellBalance: values.isSingleTrade
        ? maxSwapSellBalance
        : maxTwapSellBalance,
    }

    if (quote?.kind === "xc") {
      const operation = ++xcOperationRef.current
      submit.mutate({
        values,
        isCurrent: () => xcOperationRef.current === operation,
        abandon: abandonXcSwap,
      })
    } else if (quote?.kind === "oc" && values.isSingleTrade) {
      submitOmnipool.mutate(toSwapSubmitValues(values))
    } else if (quote?.kind === "oc" && quote.twap) {
      submitTwap.mutate(toSwapSubmitValues(values))
    } else {
      // `isXcSwapTradeEnabled` gates the button on the same quote, so this is
      // only reachable if the gate and these branches drift apart. Fail loudly
      // rather than leaving the user with a button that does nothing.
      throw new Error("Submitted without a matching quote")
    }
  }

  const isSubmitting =
    submit.isPending || submitOmnipool.isPending || submitTwap.isPending

  return { onSubmit, isSubmitting }
}
