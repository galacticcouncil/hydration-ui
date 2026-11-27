import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { FC } from "react"
import { useFormContext } from "react-hook-form"

import { spotPriceQuery } from "@/api/spotPrice"
import { useXcIntentsClient } from "@/api/xcIntents"
import { xcIntentsDestinationsQuery } from "@/api/xcIntents"
import { CrossChainSwitcher } from "@/modules/trade/swap/sections/XcSwap/components/CrossChainSwitcher"
import { XcTwapFormValues } from "@/modules/trade/swap/sections/XcTwap/XcTwap.form"
import { useRpcProvider } from "@/providers/rpcProvider"
import { NATIVE_EVM_ASSET_ID } from "@/utils/consts"

// Every order sells into WETH, then the dispatcher converts at outPerIn:
// destination smallest units per 1 WETH. Indicative; the 1Click fill can differ.
export const XcTwapSwitcher: FC = () => {
  const rpc = useRpcProvider()
  const client = useXcIntentsClient()
  const { watch } = useFormContext<XcTwapFormValues>()
  const [sellAsset, buyAsset] = watch(["sellAsset", "buyAsset"])

  const { data: spot, isLoading: isSpotLoading } = useQuery(
    spotPriceQuery(rpc, sellAsset?.id ?? "", NATIVE_EVM_ASSET_ID),
  )
  const { data: destinations, isLoading: isDestinationsLoading } = useQuery(
    xcIntentsDestinationsQuery(client),
  )

  const destination = destinations?.find((d) => d.asset === buyAsset?.key)
  const price =
    spot?.spotPrice && destination
      ? Big(spot.spotPrice).times(
          Big(destination.outPerIn.toString()).div(
            Big(10).pow(destination.decimals),
          ),
        )
      : null

  return (
    <CrossChainSwitcher
      sellAsset={sellAsset}
      buyAsset={buyAsset}
      price={price}
      isLoading={isSpotLoading || isDestinationsLoading}
    />
  )
}
