import { useQuery } from "@tanstack/react-query"
import { useCallback, useEffect, useReducer, useRef } from "react"

import { spotPriceQuery } from "@/api/spotPrice"
import {
  emptyQuotedPrice,
  nextQuotedPrice,
  PriceSource,
  QuotedPriceAction,
  QuotedPriceView,
  viewQuotedPrice,
} from "@/modules/trade/swap/lib/quotedPrice"
import { useRpcProvider } from "@/providers/rpcProvider"

type Pair = readonly [sellAssetId: string, buyAssetId: string]

type Args = {
  readonly pair: Pair
  readonly executablePrice?: string | null
  readonly onCanonicalChange: (canonical: string, source: PriceSource) => void
}

export type QuotedPriceBinding = {
  readonly view: QuotedPriceView
  readonly dispatch: (action: QuotedPriceAction) => void
  readonly isMarketLoading: boolean
}

export const useQuotedPrice = ({
  pair,
  executablePrice = null,
  onCanonicalChange,
}: Args): QuotedPriceBinding => {
  const rpc = useRpcProvider()
  const [sellAssetId, buyAssetId] = pair

  // Market anchor — the size-independent spot price. It is the clearest
  // reference (matches the Market tab) and never jumps when the order size
  // changes. Everything derived from the anchor (deviation, presets, the
  // default price, "set to market") uses this.
  const {
    data: spot,
    isPending: isSpotPending,
    isFetching: isSpotFetching,
  } = useQuery(spotPriceQuery(rpc, sellAssetId, buyAssetId))

  const marketPrice = spot?.spotPrice ?? null
  const isMarketLoading = isSpotPending || (isSpotFetching && !marketPrice)

  const [state, dispatchEvent] = useReducer(
    nextQuotedPrice,
    false, // sell→buy ("1 SELL = X BUY") across all forms
    emptyQuotedPrice,
  )

  const seenPair = useRef(pair)
  useEffect(() => {
    const [prevSell, prevBuy] = seenPair.current
    if (prevSell === sellAssetId && prevBuy === buyAssetId) return
    seenPair.current = [sellAssetId, buyAssetId]

    const type =
      prevSell === buyAssetId && prevBuy === sellAssetId
        ? "flipAssets"
        : "pairChanged"
    dispatchEvent({ type })
  }, [sellAssetId, buyAssetId])

  useEffect(() => {
    if (marketPrice) {
      dispatchEvent({ type: "market", value: marketPrice })
    }
  }, [marketPrice])

  const notify = useRef(onCanonicalChange)
  notify.current = onCanonicalChange
  useEffect(() => {
    notify.current(state.canonical, state.source)
  }, [state.canonical, state.source])

  const dispatch = useCallback(
    (action: QuotedPriceAction) => {
      if (action.type === "pct") {
        dispatchEvent({ type: "pct", value: action.value, market: marketPrice })
        return
      }

      if (action.type === "resetToMarket") {
        if (marketPrice) {
          dispatchEvent({ type: "resetToMarket", value: marketPrice })
        }
        return
      }

      dispatchEvent(action)
    },
    [marketPrice],
  )

  return {
    view: viewQuotedPrice(state, marketPrice, executablePrice),
    dispatch,
    isMarketLoading,
  }
}
