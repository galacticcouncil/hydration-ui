import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef } from "react"

import { TAsset, useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scaleHuman, toDecimal } from "@/utils/formatting"

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
  const queryClient = useQueryClient()
  const { getAsset, isExternal } = useAssets()

  const { papi, isApiLoaded } = useRpcProvider()
  const isInitialized = useRef(false)

  useEffect(() => {
    if (isInitialized.current || !isApiLoaded) {
      return
    }

    isInitialized.current = true
    console.log("new observer")

    const observer = papi.query.OTC.Orders.watchEntries({
      at: "best",
    }).subscribe((data) => {
      if (!data) {
        return
      }

      console.log("new data")

      const entry = data.entries.find(
        (a) => a.value.asset_in === 34 && a.value.asset_out === 1113,
      )

      // @ts-expect-error log
      console.log(toDecimal(entry.value.amount_out, 18))

      const newData = data.entries
        .map<OtcOffer | null>(({ args, value: offer }) => {
          const assetIn = getAsset(offer.asset_in.toString())
          const assetOut = getAsset(offer.asset_out.toString())

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
            id: args[0].toString(),
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
        .filter((offer) => !!offer)

      queryClient.setQueryData(["OTC.Orders"], newData)
    })

    return () => {
      console.log("unsubscribe")
      observer.unsubscribe()
    }
  }, [queryClient, papi, isApiLoaded, getAsset, isExternal])

  return useQuery({
    queryKey: ["OTC.Orders"],
    queryFn: () => null,
  })
}
