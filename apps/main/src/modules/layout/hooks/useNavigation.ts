import { useMemo } from "react"

import { NAVIGATION, NavigationItem } from "@/config/navigation"
import { useHasFillableStableBondsOrders } from "@/modules/strategies/stable-bonds/hooks/useHasFillableStableBondsOrders"
import { useRpcProvider } from "@/providers/rpcProvider"

export const useNavigation = (): NavigationItem[] => {
  const { featureFlags } = useRpcProvider()
  const hasFillableStableBondsOrders = useHasFillableStableBondsOrders()

  return useMemo(
    () =>
      NAVIGATION.filter((item) => {
        if (item.key === "strategiesHollarBonds") {
          return featureFlags.hollarBondsEnabled && hasFillableStableBondsOrders
        }

        return item.enabled !== false
      }),
    [featureFlags.hollarBondsEnabled, hasFillableStableBondsOrders],
  )
}
