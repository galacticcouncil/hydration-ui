import { XcSwapClient, XcSwapTrade } from "@galacticcouncil/xc-swap"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { useDebounce } from "react-use"

import {
  bestBuyQuery,
  bestBuyTwapQuery,
  bestSellQuery,
  bestSellTwapQuery,
  Trade,
  TradeOrder,
  TradeType,
} from "@/api/trade"
import { XC_SWAP_RECIPIENT_PLACEHOLDERS } from "@/config/xcSwap"
import { isTwapEnabled } from "@/modules/trade/swap/sections/Market/lib/isTwapEnabled"
import { XcAsset } from "@/modules/trade/swap/sections/XcSwap/data/mock"
import { XcSwapFormValues } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapForm"
import { assertXcSwapQuoteParams } from "@/modules/trade/swap/sections/XcSwap/lib/assertXcSwapQuoteParams"
import {
  isXcDestAsset,
  sellAssetToXcAsset,
} from "@/modules/trade/swap/sections/XcSwap/lib/xcSwapAssets"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scale, scaleHuman } from "@/utils/formatting"

export type XcSwapQuote =
  | { kind: "xc"; swap: XcSwapTrade }
  | { kind: "oc"; swap: Trade; twap: TradeOrder | undefined }
  | null

type UseXcSwapQuoteParams = {
  form: UseFormReturn<XcSwapFormValues>
  rpc: ReturnType<typeof useRpcProvider>
  xcSwap: XcSwapClient
  originAssetMap: Map<string, XcAsset>
  isCrossChain: boolean
  refundTo: string | null
  swapSlippage: number
}

export const useXcSwapQuote = ({
  form,
  rpc,
  xcSwap,
  originAssetMap,
  isCrossChain,
  refundTo,
  swapSlippage,
}: UseXcSwapQuoteParams) => {
  const { isApiLoaded } = rpc

  const sellAsset = form.watch("sellAsset")
  const buyAsset = form.watch("buyAsset")
  const destChain = form.watch("destChain")
  const isSingleTrade = form.watch("isSingleTrade")
  const type = form.watch("type")
  const sellAmount = form.watch("sellAmount")
  const buyAmount = form.watch("buyAmount")
  const destAddress = form.watch("destAddress")

  const recipientPlaceholder = destChain
    ? XC_SWAP_RECIPIENT_PLACEHOLDERS[destChain.key]
    : undefined
  const isDestAddressValid = destChain
    ? destChain.addressValidator(destAddress.trim())
    : false

  const recipient = isDestAddressValid
    ? destAddress.trim()
    : recipientPlaceholder

  const [debouncedAmount, setDebouncedAmount] = useState("")
  useDebounce(() => setDebouncedAmount(sellAmount), 200, [sellAmount])

  const [debouncedBuyAmount, setDebouncedBuyAmount] = useState("")
  useDebounce(() => setDebouncedBuyAmount(buyAmount), 200, [buyAmount])

  const amountIn =
    sellAsset && debouncedAmount
      ? BigInt(scale(debouncedAmount, sellAsset.decimals))
      : null

  const xcQuoteEnabled =
    isCrossChain &&
    isApiLoaded &&
    !!refundTo &&
    !!recipient &&
    !!sellAsset &&
    isXcDestAsset(buyAsset) &&
    amountIn !== null &&
    amountIn > 0n

  const {
    data: xcTrade,
    isFetching: isXcQuoteLoading,
    error: xcQuoteError,
  } = useQuery({
    enabled: xcQuoteEnabled,
    retry: false,
    queryKey: [
      "xcSwap",
      "quote",
      sellAsset?.id,
      amountIn?.toString(),
      isXcDestAsset(buyAsset) ? buyAsset.oneClickId : undefined,
      recipient,
      refundTo,
      swapSlippage,
    ],
    queryFn: () => {
      if (!sellAsset) {
        throw new Error("Source asset is required")
      }

      return xcSwap.swap(
        assertXcSwapQuoteParams({
          srcAsset: sellAssetToXcAsset(sellAsset, originAssetMap),
          amountIn,
          destAsset: buyAsset,
          recipient,
          refundTo,
          slippage: swapSlippage,
        }),
      )
    },
  })

  const isOnChainBuy = !isCrossChain && type === TradeType.Buy
  const omnipoolAssetIn = sellAsset?.id ?? ""
  const omnipoolAssetOut = buyAsset?.id !== undefined ? String(buyAsset.id) : ""

  const omnipoolQueryOptions = isOnChainBuy
    ? bestBuyQuery(rpc, {
        assetIn: omnipoolAssetIn,
        assetOut: omnipoolAssetOut,
        amountOut: debouncedBuyAmount,
      })
    : bestSellQuery(rpc, {
        assetIn: omnipoolAssetIn,
        assetOut: omnipoolAssetOut,
        amountIn: debouncedAmount,
      })
  const {
    data: omnipoolTrade,
    isFetching: isOmnipoolQuoteLoading,
    error: omnipoolQuoteError,
  } = useQuery({
    ...omnipoolQueryOptions,
    enabled: !isCrossChain && omnipoolQueryOptions.enabled,
  })

  const { data: twap, isFetching: isTwapLoading } = useQuery(
    isOnChainBuy
      ? bestBuyTwapQuery(
          rpc,
          {
            assetIn: omnipoolAssetIn,
            assetOut: omnipoolAssetOut,
            amountOut: debouncedBuyAmount,
          },
          !isCrossChain && isTwapEnabled(omnipoolTrade),
        )
      : bestSellTwapQuery(
          rpc,
          {
            assetIn: omnipoolAssetIn,
            assetOut: omnipoolAssetOut,
            amountIn: debouncedAmount,
          },
          !isCrossChain && isTwapEnabled(omnipoolTrade),
        ),
  )

  const quote = useMemo<XcSwapQuote>(() => {
    if (isCrossChain) {
      if (!xcQuoteEnabled) return null
      return xcTrade ? { kind: "xc", swap: xcTrade } : null
    }
    return omnipoolTrade ? { kind: "oc", swap: omnipoolTrade, twap } : null
  }, [isCrossChain, xcQuoteEnabled, xcTrade, omnipoolTrade, twap])

  const isQuoteLoading = isCrossChain
    ? isXcQuoteLoading
    : isOmnipoolQuoteLoading
  const quoteError = isCrossChain ? xcQuoteError : omnipoolQuoteError

  useEffect(() => {
    if (quote?.kind === "xc") {
      form.setValue("buyAmount", quote.swap.amountOut.toDecimal(), {
        shouldValidate: true,
      })
    } else if (quote?.kind === "oc" && type === TradeType.Buy && sellAsset) {
      // Buy: derive the required sellAmount from the quote's amountIn
      const amountIn = isSingleTrade
        ? quote.swap.amountIn
        : quote.twap?.amountIn
      const nextSellAmount = amountIn
        ? scaleHuman(amountIn, sellAsset.decimals)
        : ""

      if (form.getValues("sellAmount") !== nextSellAmount) {
        form.setValue("sellAmount", nextSellAmount, { shouldValidate: true })
      }
    } else if (quote?.kind === "oc" && buyAsset) {
      // Sell: derive buyAmount from the quote's amountOut
      const amountOut = isSingleTrade
        ? quote.swap.amountOut
        : quote.twap?.amountOut
      const nextBuyAmount = amountOut
        ? scaleHuman(amountOut, buyAsset.decimals)
        : ""

      if (form.getValues("buyAmount") !== nextBuyAmount) {
        form.setValue("buyAmount", nextBuyAmount, { shouldValidate: true })
      }
    } else if (type === TradeType.Buy) {
      if (form.getValues("sellAmount")) {
        form.setValue("sellAmount", "", { shouldValidate: true })
      }
    } else if (form.getValues("buyAmount")) {
      form.setValue("buyAmount", "", { shouldValidate: true })
    }
  }, [quote, buyAsset, sellAsset, form, isSingleTrade, type])

  return { quote, isQuoteLoading, isTwapLoading, quoteError }
}
