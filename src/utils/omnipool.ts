import {
  calculate_liquidity_lrna_out,
  calculate_liquidity_out,
} from "@galacticcouncil/math-omnipool"
import { OmnipoolPosition, useOmnipoolAssets } from "api/omnipool"
import BN from "bignumber.js"
import { BN_NAN } from "utils/constants"
import { useDisplayPrices, useDisplayPrice } from "./displayAsset"
import { useRpcProvider } from "providers/rpcProvider"
import { scale } from "./balance"
import { useCallback } from "react"

type IOptions = {
  sharesValue?: string
  fee?: string
}

export const useLiquidityPositionData = (assetsId?: string[]) => {
  const { assets } = useRpcProvider()

  const omnipoolAssets = useOmnipoolAssets()
  const omnipoolAssetIds = omnipoolAssets.data?.map((asset) => asset.id) ?? []

  const hubSp = useDisplayPrice(assets.hub.id)
  const spotPrices = useDisplayPrices(assetsId ?? omnipoolAssetIds)

  const getData = useCallback(
    (position: Omit<OmnipoolPosition, "id">, options?: IOptions) => {
      const omnipoolAsset = omnipoolAssets.data?.find(
        (omnipoolAsset) => omnipoolAsset.id === position.assetId.toString(),
      )

      if (!omnipoolAsset) return undefined

      const spotPrice = spotPrices.data?.find(
        (sp) => sp?.tokenIn === omnipoolAsset.id,
      )?.spotPrice

      if (!spotPrice || !hubSp.data?.spotPrice) return undefined

      const [nom, denom] = position.price.map((n) => new BN(n.toString()))
      const price = nom.div(denom)

      const shares = position.shares

      const positionPrice = scale(price, "q")

      let lernaOutResult = "-1"
      let liquidityOutResult = "-1"

      const params: Parameters<typeof calculate_liquidity_out> = [
        omnipoolAsset.balance.toString(),
        omnipoolAsset.data.hubReserve.toString(),
        omnipoolAsset.data.shares.toString(),
        position.amount.toString(),
        position.shares.toString(),
        positionPrice.toFixed(0),
        options?.sharesValue ?? position.shares.toString(),
        options?.fee ?? "0",
      ]

      lernaOutResult = calculate_liquidity_lrna_out.apply(this, params)
      liquidityOutResult = calculate_liquidity_out.apply(this, params)

      const lrna =
        lernaOutResult !== "-1"
          ? new BN(lernaOutResult).shiftedBy(-assets.hub.decimals)
          : BN_NAN

      const value =
        liquidityOutResult !== "-1"
          ? new BN(liquidityOutResult).shiftedBy(-omnipoolAsset.meta.decimals)
          : BN_NAN

      const amount = position.amount

      let valueDisplay = BN_NAN
      let valueDisplayWithoutLrna = BN_NAN

      const amountDisplay = amount.times(spotPrice)

      if (liquidityOutResult !== "-1") {
        valueDisplay = value.times(spotPrice)

        valueDisplayWithoutLrna = valueDisplay

        if (lrna.gt(0)) {
          valueDisplay = valueDisplay.plus(lrna.times(hubSp.data.spotPrice))
        }
      }

      return {
        lrna,
        value,
        valueDisplay,
        valueDisplayWithoutLrna,
        price: position.price,
        amount,
        amountDisplay,
        shares,
        amountShifted: amount.shiftedBy(-omnipoolAsset.meta.decimals),
      }
    },
    [
      assets.hub.decimals,
      hubSp.data?.spotPrice,
      omnipoolAssets.data,
      spotPrices.data,
    ],
  )

  return { getData }
}
