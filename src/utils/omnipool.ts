import {
  calculate_liquidity_lrna_out,
  calculate_liquidity_out,
} from "@galacticcouncil/math-omnipool"
import { u128 } from "@polkadot/types-codec"
import { PalletOmnipoolPosition } from "@polkadot/types/lookup"
import { OmnipoolPosition } from "api/omnipool"
import BN from "bignumber.js"
import { BN_10, BN_NAN } from "utils/constants"

export const calculatePositionLiquidity = ({
  position,
  omnipoolBalance,
  omnipoolHubReserve,
  omnipoolShares,
  lrnaSpotPrice,
  valueSpotPrice,
  lrnaDecimals,
  assetDecimals,
}: {
  position: PalletOmnipoolPosition | OmnipoolPosition
  omnipoolBalance?: BN
  omnipoolHubReserve?: u128
  omnipoolShares?: u128
  lrnaSpotPrice: BN
  valueSpotPrice: BN
  lrnaDecimals: number
  assetDecimals: number
}) => {
  const [nom, denom] = position.price.map((n) => new BN(n.toString()))
  const price = nom.div(denom)
  const positionPrice = price.times(BN_10.pow(18))

  let lernaOutResult = "-1"
  let liquidityOutResult = "-1"

  if (omnipoolBalance && omnipoolHubReserve && omnipoolShares) {
    const params: Parameters<typeof calculate_liquidity_out> = [
      omnipoolBalance.toString(),
      omnipoolHubReserve.toString(),
      omnipoolShares.toString(),
      position.amount.toString(),
      position.shares.toString(),
      positionPrice.toFixed(0),
      position.shares.toString(),
      "0", // fee zero
    ]
    lernaOutResult = calculate_liquidity_lrna_out.apply(this, params)
    liquidityOutResult = calculate_liquidity_out.apply(this, params)
  }

  const lrnaDp = BN_10.pow(lrnaDecimals)
  const lrna =
    lernaOutResult !== "-1" ? new BN(lernaOutResult).div(lrnaDp) : BN_NAN

  const valueDp = BN_10.pow(assetDecimals)
  const value =
    liquidityOutResult !== "-1"
      ? new BN(liquidityOutResult).div(valueDp)
      : BN_NAN
  let valueDisplay = BN_NAN

  const providedAmount = position.amount.toBigNumber().div(valueDp)
  let providedAmountDisplay = providedAmount.times(valueSpotPrice)

  const shares = position.shares.toBigNumber()

  if (liquidityOutResult !== "-1" && valueSpotPrice) {
    valueDisplay = value.times(valueSpotPrice)

    if (lrna.gt(0)) {
      valueDisplay = !lrnaSpotPrice
        ? BN_NAN
        : valueDisplay.plus(lrna.times(lrnaSpotPrice))
    }
  }

  return {
    lrna,
    value,
    valueDisplay,
    price,
    providedAmountShifted: providedAmount,
    providedAmount: position.amount.toBigNumber(),
    providedAmountDisplay,
    shares,
  }
}
