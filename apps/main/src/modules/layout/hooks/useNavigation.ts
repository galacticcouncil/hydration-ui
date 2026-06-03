import { useMemo } from "react"

import { NAVIGATION, NavigationItem } from "@/config/navigation"
import { useRpcProvider } from "@/providers/rpcProvider"

export const useNavigation = (): NavigationItem[] => {
  const { featureFlags } = useRpcProvider()

  return useMemo(
    () =>
      NAVIGATION.filter((item) => {
        if (item.key === "strategiesHollarBonds") {
          return featureFlags.hollarBondsEnabled
        }

        return item.enabled !== false
      }),
    [featureFlags.hollarBondsEnabled],
  )
}
