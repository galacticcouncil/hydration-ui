import { useMutation } from "@tanstack/react-query"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useFormContext } from "react-hook-form"

import { useCalculateBuyAmount } from "@/modules/trade/swap/sections/Market/lib/useCalculateBuyAmount"
import { useCalculateSellAmount } from "@/modules/trade/swap/sections/Market/lib/useCalculateSellAmount"
import {
  MarketFormValues,
  TradeType,
} from "@/modules/trade/swap/sections/Market/lib/useMarketForm"

export const useSwitchAssets = () => {
  const navigate = useNavigate()
  const search = useSearch({ from: "/trade/_history" })

  const { getValues, reset, trigger } = useFormContext<MarketFormValues>()

  const calculateBuyAmount = useCalculateBuyAmount()
  const calculateSellAmount = useCalculateSellAmount()

  return useMutation({
    mutationFn: async () => {
      const { buyAmount, sellAmount, sellAsset, buyAsset, type } = getValues()

      if (!sellAsset || !buyAsset) {
        return
      }

      const newSellAsset = buyAsset
      const newBuyAsset = sellAsset

      const [newType, newSellAmount, newBuyAmount] =
        type === TradeType.Sell
          ? [
              TradeType.Buy,
              sellAmount &&
                (await calculateSellAmount(
                  newSellAsset,
                  newBuyAsset,
                  sellAmount,
                )),
              sellAmount,
            ]
          : [
              TradeType.Sell,
              buyAmount,
              buyAmount &&
                (await calculateBuyAmount(
                  newSellAsset,
                  newBuyAsset,
                  buyAmount,
                )),
            ]

      const newFormValues: MarketFormValues = {
        sellAsset: newSellAsset,
        sellAmount: newSellAmount,
        buyAsset: newBuyAsset,
        buyAmount: newBuyAmount,
        type: newType,
        isSingleTrade: true,
      }

      reset(newFormValues)
      trigger()

      return { newSellAsset, newBuyAsset }
    },
    onSuccess: (newParams) => {
      if (!newParams) {
        return
      }

      const { newSellAsset, newBuyAsset } = newParams

      navigate({
        to: ".",
        search: {
          ...search,
          assetIn: newSellAsset?.id,
          assetOut: newBuyAsset?.id,
        },
        resetScroll: false,
      })
    },
  })
}
