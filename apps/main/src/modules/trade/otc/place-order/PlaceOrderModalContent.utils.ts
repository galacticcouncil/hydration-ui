import Big from "big.js"

import { PriceSettings } from "@/modules/trade/otc/place-order/PlaceOrderModalContent.form"

export const getOmnipoolPrice = (spotPrice: string | null | undefined) => {
  const isPriceValid = !!spotPrice && spotPrice !== "NaN"

  return [isPriceValid ? spotPrice : "0", { isPriceValid }] as const
}

export const getPrice = (
  priceSettings: PriceSettings,
  omnipoolPrice: string,
) => {
  const omnipoolPriceBig = Big(omnipoolPrice)

  const price =
    priceSettings.type == "fixed"
      ? priceSettings.value || "0"
      : omnipoolPriceBig
          .div(100)
          .times(Big(100).plus(priceSettings.percentage))
          .toString()

  const priceGain =
    priceSettings.type === "relative"
      ? priceSettings.percentage.toString()
      : omnipoolPriceBig.eq(0)
        ? "0"
        : Big(price).div(omnipoolPrice).minus(1).times(100).toString()

  return { price, priceGain }
}
