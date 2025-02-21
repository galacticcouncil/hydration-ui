import type {
  bool,
  GenericAccountId32,
  Struct,
  u32,
  u128,
} from "@polkadot/types"
import { Option } from "@polkadot/types-codec"
import { useQuery } from "@tanstack/react-query"

import { TAsset, useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

interface PalletOtcOrder extends Struct {
  readonly owner: GenericAccountId32
  readonly assetIn: u32
  readonly assetOut: u32
  readonly amountIn: u128
  readonly amountOut: u128
  readonly partiallyFillable: bool
}

export type OtcOffer = {
  readonly id: string | undefined
  readonly owner: string
  readonly assetInId: string
  readonly assetIn: TAsset | undefined
  readonly assetOutId: string
  readonly assetOut: TAsset | undefined
  readonly amountIn: string
  readonly amountOut: string
  readonly isPartiallyFillable: boolean
}

export const useOtcOffersQuery = () => {
  const { api, isLoaded: isRpcReady } = useRpcProvider()
  const { getAsset, isExternal } = useAssets()

  const { isLoading, ...queryResult } = useQuery({
    queryKey: ["trade", "otc", "offers"],
    queryFn: async () => {
      const res = await api.query.otc.orders.entries()

      return res
        .map<OtcOffer | undefined>(([key, codec]) => {
          if (codec.isEmpty) {
            return undefined
          }

          const data = (codec as Option<PalletOtcOrder>).unwrap()

          const offer: OtcOffer = {
            id: key.args[0]?.toString(),
            owner: data.owner.toString(),
            assetInId: data.assetIn.toString(),
            assetIn: getAsset(data.assetIn.toString()),
            assetOutId: data.assetOut.toString(),
            assetOut: getAsset(data.assetOut.toString()),
            amountIn: data.amountIn.toString(),
            amountOut: data.amountOut.toString(),
            isPartiallyFillable: data.partiallyFillable.toPrimitive(),
          }

          const isAssetInValid =
            offer.assetIn && isExternal(offer.assetIn)
              ? !!offer.assetIn.name
              : true

          const isAssetOutValid =
            offer.assetOut && isExternal(offer.assetOut)
              ? !!offer.assetOut.name
              : true

          return isAssetInValid && isAssetOutValid ? offer : undefined
        })
        .filter((offer) => !!offer)
    },
    enabled: isRpcReady,
    initialData: [],
  })

  return {
    ...queryResult,
    isLoading: isLoading || !isRpcReady,
  } as const
}
