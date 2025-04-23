import { useQuery } from "@tanstack/react-query"

import { TAsset, useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { QUERY_KEY_BLOCK_PREFIX } from "@/utils/consts"

export type OtcOffer = {
  readonly id: string | undefined
  readonly owner: string
  readonly assetIn: TAsset
  readonly assetOut: TAsset
  readonly amountIn: string
  readonly amountOut: string
  readonly isPartiallyFillable: boolean
}

export const otcOffersQueryKey = [
  QUERY_KEY_BLOCK_PREFIX,
  "trade",
  "otc",
  "offers",
]

export const useOtcOffersQuery = () => {
  const { papi, isLoaded: isRpcReady } = useRpcProvider()
  const { getAsset, isExternal } = useAssets()

  const { isLoading, ...queryResult } = useQuery({
    queryKey: otcOffersQueryKey,
    queryFn: async (): Promise<ReadonlyArray<OtcOffer>> => {
      const offers = await papi.query.OTC.Orders.getEntries()

      return offers
        .map<OtcOffer | null>(({ keyArgs, value: offer }) => {
          const assetIn = getAsset(offer.asset_in.toString())
          const assetOut = getAsset(offer.asset_out.toString())

          const isAssetInValid =
            !!assetIn && (!isExternal(assetIn) || !!assetIn.name)

          const isAssetOutValid =
            !!assetOut && (!isExternal(assetOut) || !!assetOut.name)

          if (!isAssetInValid || !isAssetOutValid) {
            return null
          }

          return {
            id: keyArgs[0].toString(),
            owner: offer.owner.toString(),
            assetIn: assetIn,
            assetOut: assetOut,
            amountIn: offer.amount_in.toString(),
            amountOut: offer.amount_out.toString(),
            isPartiallyFillable: offer.partially_fillable,
          }
        })
        .filter((offer) => !!offer)
    },
    enabled: isRpcReady,
  })

  return {
    ...queryResult,
    isLoading: isLoading || !isRpcReady,
  } as const
}
