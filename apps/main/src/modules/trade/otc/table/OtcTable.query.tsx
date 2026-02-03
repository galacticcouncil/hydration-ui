import { usePapiEntries } from "@/hooks/usePapiEntries"
import { TAsset, useAssets } from "@/providers/assetsProvider"
import { scaleHuman } from "@/utils/formatting"

export type OtcOffer = {
  readonly id: string | undefined
  readonly owner: string
  readonly assetIn: TAsset
  readonly assetOut: TAsset
  readonly amountIn: string
  readonly amountOut: string
  readonly assetAmountIn: string
  readonly assetAmountOut: string
  readonly isPartiallyFillable: boolean
}

export const useOtcOffers = () => {
  const { getAsset, isExternal } = useAssets()

  return usePapiEntries("OTC.Orders", [], (entries) =>
    entries
      .map<OtcOffer | null>(({ keyArgs, value: offer }) => {
        const assetIn = getAsset(offer.asset_in)
        const assetOut = getAsset(offer.asset_out)

        const isAssetInValid =
          !!assetIn && (!isExternal(assetIn) || !!assetIn.name)

        const isAssetOutValid =
          !!assetOut && (!isExternal(assetOut) || !!assetOut.name)

        if (!isAssetInValid || !isAssetOutValid) {
          return null
        }

        const amountIn = offer.amount_in.toString()
        const amountOut = offer.amount_out.toString()

        const assetAmountIn = scaleHuman(amountIn, assetIn.decimals)
        const assetAmountOut = scaleHuman(amountOut, assetOut.decimals)

        return {
          id: keyArgs[0].toString(),
          owner: offer.owner.toString(),
          assetIn: assetIn,
          assetOut: assetOut,
          amountIn,
          amountOut,
          assetAmountIn,
          assetAmountOut,
          isPartiallyFillable: offer.partially_fillable,
        }
      })
      .filter((offer) => !!offer),
  )
}
