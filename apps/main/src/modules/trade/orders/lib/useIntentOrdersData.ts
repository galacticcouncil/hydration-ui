import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { useCallback, useMemo } from "react"

import { useAccountIntents } from "@/api/intents"
import { useXcIntentsClient } from "@/api/xcIntents"
import { xcIntentsDestinationsQuery } from "@/api/xcIntents"
import { buildIntentOrderRows } from "@/modules/trade/orders/lib/buildOrderRows"
import {
  OrderData,
  XcDestinationDisplay,
} from "@/modules/trade/orders/lib/orderData"
import { xcTwapOf } from "@/modules/trade/orders/lib/xcTwap"
import { DESTINATION_LOGOS } from "@/modules/trade/swap/sections/XcTwap/hooks/useXcTwapAssetPairs"
import { toXcDestinationPairs } from "@/modules/trade/swap/sections/XcTwap/utils/destinations"
import { useAssets } from "@/providers/assetsProvider"
import { numericallyDesc } from "@/utils/sort"

export const useXcDestinationLookup = (enabled: boolean) => {
  const client = useXcIntentsClient()
  const { data: destinations } = useQuery({
    ...xcIntentsDestinationsQuery(client),
    enabled,
  })

  const byLedgerId = useMemo(
    () =>
      new Map<string, XcDestinationDisplay>(
        toXcDestinationPairs(destinations ?? [], DESTINATION_LOGOS).map(
          ({ chain, asset }) => [
            asset.key,
            {
              symbol: asset.symbol,
              decimals: asset.decimals,
              logo: asset.logo,
              chainLogo: chain.logo,
            },
          ],
        ),
      ),
    [destinations],
  )

  return useCallback(
    (ledgerId: string) => byLedgerId.get(ledgerId) ?? null,
    [byLedgerId],
  )
}

export const useIntentOrdersData = () => {
  const { account } = useAccount()
  const { getAssetWithFallback } = useAssets()

  const {
    data: intents,
    isLoading,
    isError,
  } = useAccountIntents(account?.address ?? "")

  const hasXcTwap = useMemo(
    () => !!intents?.some((entry) => xcTwapOf(entry.intent)),
    [intents],
  )
  const getXcDestination = useXcDestinationLookup(hasXcTwap)

  const orders = useMemo<OrderData[]>(() => {
    if (!intents) return []

    return buildIntentOrderRows(
      intents,
      getAssetWithFallback,
      getXcDestination,
    ).sort((a, b) => numericallyDesc(a.timestamp ?? 0, b.timestamp ?? 0))
  }, [intents, getAssetWithFallback, getXcDestination])

  return { orders, isLoading, isError }
}
