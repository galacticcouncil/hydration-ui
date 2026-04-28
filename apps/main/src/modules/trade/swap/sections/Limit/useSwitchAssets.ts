import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import Big from "big.js"
import { useFormContext } from "react-hook-form"

import {
  FieldName,
  LastTwo,
} from "@/modules/trade/swap/sections/Limit/cascadeLogic"
import { LimitFormValues } from "@/modules/trade/swap/sections/Limit/useLimitForm"

/** Swap "sell" ↔ "buy" in a LastTwo tuple, leaving "price" untouched. */
const flipAmountSidesInLastTwo = (lastTwo: LastTwo): LastTwo => {
  const flip = (f: FieldName): FieldName =>
    f === "sell" ? "buy" : f === "buy" ? "sell" : "price"
  return [flip(lastTwo[0]), flip(lastTwo[1])]
}

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
        lastTwo,
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

      // Touch recency follows through the swap: the kept-pair entry
      // for "sell" becomes "buy" and vice versa; "price" stays put.
      const newLastTwo = flipAmountSidesInLastTwo(lastTwo)

      reset({
        ...values,
        sellAsset: buyAsset,
        buyAsset: sellAsset,
        sellAmount: newSellAmount,
        buyAmount: newBuyAmount,
        limitPrice: newPrice,
        lastTwo: newLastTwo,
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
