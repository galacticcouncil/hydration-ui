import { useNavigate } from "@tanstack/react-router"
import { useCallback } from "react"
import { useFormContext } from "react-hook-form"

import { TradeType } from "@/api/trade"
import { MarketFormValues } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"

export const useSwitchAssets = () => {
  const navigate = useNavigate()

  const { getValues, reset } = useFormContext<MarketFormValues>()

  return useCallback(() => {
    const { buyAmount, sellAmount, sellAsset, buyAsset, type } = getValues()

    if (!sellAsset || !buyAsset) {
      return
    }

    const newSellAsset = buyAsset
    const newBuyAsset = sellAsset

    const [newType, newSellAmount, newBuyAmount] =
      type === TradeType.Sell
        ? [TradeType.Buy, buyAmount, sellAmount]
        : [TradeType.Sell, buyAmount, sellAmount]

    const newFormValues: MarketFormValues = {
      sellAsset: newSellAsset,
      sellAmount: newSellAmount,
      buyAsset: newBuyAsset,
      buyAmount: newBuyAmount,
      type: newType,
      isSingleTrade: true,
    }

    reset(newFormValues)

    navigate({
      to: ".",
      search: (search) => ({
        ...search,
        assetIn: newSellAsset?.id,
        assetOut: newBuyAsset?.id,
      }),
      resetScroll: false,
    })
  }, [getValues, reset, navigate])
}
