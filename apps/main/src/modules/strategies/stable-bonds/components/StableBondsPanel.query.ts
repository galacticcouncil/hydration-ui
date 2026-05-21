import { useQuery } from "@tanstack/react-query"

import { STABLE_BONDS_OTC_ORDER_IDS } from "@/modules/strategies/stable-bonds/constants"
import { type TAsset, useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scaleHuman } from "@/utils/formatting"

export type StableBondsOtcOrder = {
  readonly id: string
  readonly owner: string
  readonly assetIn: TAsset
  readonly assetOut: TAsset
  readonly amountIn: string
  readonly amountOut: string
  readonly assetAmountIn: string
  readonly assetAmountOut: string
  readonly isPartiallyFillable: boolean
}

export const useStableBondsOtcOrders = () => {
  const { papi, isApiLoaded } = useRpcProvider()
  const { getAsset, isExternal } = useAssets()

  return useQuery({
    queryKey: ["strategies", "stable-bonds", "otc-orders"],
    enabled: isApiLoaded,
    queryFn: async (): Promise<StableBondsOtcOrder[]> => {
      const entries = await Promise.all(
        STABLE_BONDS_OTC_ORDER_IDS.map(async (orderId) => ({
          orderId,
          offer: await papi.query.OTC.Orders.getValue(orderId),
        })),
      )

      return entries
        .map<StableBondsOtcOrder | null>(({ orderId, offer }) => {
          if (!offer) {
            return null
          }

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

          return {
            id: orderId.toString(),
            owner: offer.owner.toString(),
            assetIn,
            assetOut,
            amountIn,
            amountOut,
            assetAmountIn: scaleHuman(amountIn, assetIn.decimals),
            assetAmountOut: scaleHuman(amountOut, assetOut.decimals),
            isPartiallyFillable: offer.partially_fillable,
          }
        })
        .filter((offer): offer is StableBondsOtcOrder => !!offer)
    },
  })
}
