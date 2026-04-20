import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import Big from "big.js"
import { useFormContext } from "react-hook-form"

import { LimitFormValues } from "@/modules/trade/swap/sections/Limit/useLimitForm"

export const useSwitchAssets = () => {
  const navigate = useNavigate()
  const { reset, getValues, trigger } = useFormContext<LimitFormValues>()

  return useMutation({
    mutationFn: async () => {
      const values = getValues()
      const {
        sellAsset,
        buyAsset,
        sellAmount,
        buyAmount,
        limitPrice,
        amountAnchor,
      } = values

      // Invert the limit price. Store at full precision so the display
      // layer (LimitPriceSection) can format without precision loss and
      // flipping back still round-trips cleanly.
      let newPrice = ""
      if (limitPrice) {
        try {
          const priceBig = new Big(limitPrice)
          if (priceBig.gt(0)) {
            newPrice = Big(1).div(priceBig).toString()
          }
        } catch {
          // ignore invalid price
        }
      }

      // Swap amounts: old sellAmount becomes new buyAmount (user was
      // "selling N of X" — after flip they're now "buying N of X" by
      // selling the opposite asset), and vice versa.
      const newSellAmount = buyAmount
      const newBuyAmount = sellAmount

      // Anchor follows the user's last-touched amount through the swap:
      // the value that WAS in sell is now in buy and vice versa.
      const newAnchor: "sell" | "buy" = amountAnchor === "sell" ? "buy" : "sell"

      reset({
        ...values,
        sellAsset: buyAsset,
        buyAsset: sellAsset,
        sellAmount: newSellAmount,
        buyAmount: newBuyAmount,
        limitPrice: newPrice,
        amountAnchor: newAnchor,
      })

      trigger()

      navigate({
        to: ".",
        search: (search) => ({
          ...search,
          assetIn: buyAsset?.id,
          assetOut: sellAsset?.id,
        }),
        resetScroll: false,
      })
    },
  })
}
