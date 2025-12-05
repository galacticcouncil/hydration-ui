import { math } from "@galacticcouncil/sdk-next"
import { getReversePrice } from "@galacticcouncil/utils"
import Big from "big.js"

import { PriceSettings } from "@/modules/trade/otc/place-order/PlaceOrderModalContent.form"
import { scale } from "@/utils/formatting"

export const getOmnipoolPrice = (spotPrice: string | null | undefined) => {
  const isPriceValid = !!spotPrice && spotPrice !== "NaN"

  return [isPriceValid ? spotPrice : "0", { isPriceValid }] as const
}

export const getPrice = (
  priceSettings: PriceSettings,
  omnipoolPrice: string,
  priceDecimals: number,
) => {
  const omnipoolPriceBig = Big(omnipoolPrice)

  if (priceSettings.type === "fixed") {
    const priceGain = omnipoolPriceBig.eq(0)
      ? "0"
      : Big(
          math.calculateDiffToRef(
            BigInt(scale(priceSettings.offerPrice, priceDecimals)),
            BigInt(scale(omnipoolPrice, priceDecimals)),
          ),
        ).toString()

    return {
      offerPrice: priceSettings.offerPrice || "0",
      buyPrice: priceSettings.buyPrice || "0",
      priceGain,
    }
  }

  const offerPrice = calculatePriceWithDiff(
    omnipoolPriceBig.toString(),
    Big(priceSettings.percentage).toString(),
  )

  const buyPrice = getReversePrice(offerPrice)

  return {
    offerPrice,
    buyPrice,
    priceGain: priceSettings.percentage.toString(),
  }
}

const calculatePriceWithDiff = (
  omnipoolPrice: string,
  percentage: string,
): string =>
  Big(omnipoolPrice).times(Big(percentage).div(100).plus(1)).toString()
