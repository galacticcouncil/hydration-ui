import { math } from "@galacticcouncil/sdk-next"
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

  const price =
    priceSettings.type == "fixed"
      ? priceSettings.value || "0"
      : calculatePriceWithDiff(
          omnipoolPriceBig.toString(),
          Big(priceSettings.percentage).times(-1).toString(),
        )

  const priceGain =
    priceSettings.type === "relative"
      ? priceSettings.percentage.toString()
      : omnipoolPriceBig.eq(0)
        ? "0"
        : Big(
            math.calculateDiffToRef(
              BigInt(scale(omnipoolPrice, priceDecimals)),
              BigInt(scale(price, priceDecimals)),
            ),
          )
            .times(-1)
            .toString()

  return { price, priceGain }
}

const calculatePriceWithDiff = (
  omnipoolPrice: string,
  percentage: string,
): string => Big(omnipoolPrice).div(Big(percentage).div(100).plus(1)).toString()
