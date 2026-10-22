import { TAssetData } from "@/api/assets"
import { TradeType } from "@/api/trade"
import type { XcSwapQuote } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapQuote"
import { XcAsset } from "@/modules/trade/swap/sections/XcSwap/types"
import { scaleHuman } from "@/utils/formatting"

type QuoteFormUpdate = {
  field: "sellAmount" | "buyAmount"
  value: string
}

type GetQuoteFormUpdateInput = {
  quote: XcSwapQuote
  type: TradeType
  sellAsset: TAssetData | null
  buyAsset: XcAsset | null
  isSingleTrade: boolean
}

export const getQuoteFormUpdate = ({
  quote,
  type,
  sellAsset,
  buyAsset,
  isSingleTrade,
}: GetQuoteFormUpdateInput): QuoteFormUpdate => {
  if (quote?.kind === "xc") {
    return { field: "buyAmount", value: quote.swap.amountOut.toDecimal() }
  }

  if (quote?.kind === "oc" && type === TradeType.Buy && sellAsset) {
    // Buy: derive the required sellAmount from the quote's amountIn
    const amountIn = isSingleTrade ? quote.swap.amountIn : quote.twap?.amountIn
    return {
      field: "sellAmount",
      value: amountIn ? scaleHuman(amountIn, sellAsset.decimals) : "",
    }
  }

  if (quote?.kind === "oc" && buyAsset) {
    // Sell: derive buyAmount from the quote's amountOut
    const amountOut = isSingleTrade
      ? quote.swap.amountOut
      : quote.twap?.amountOut
    return {
      field: "buyAmount",
      value: amountOut ? scaleHuman(amountOut, buyAsset.decimals) : "",
    }
  }

  // No usable quote: clear the output field for the current trade direction.
  if (type === TradeType.Buy) {
    return { field: "sellAmount", value: "" }
  }

  return { field: "buyAmount", value: "" }
}
