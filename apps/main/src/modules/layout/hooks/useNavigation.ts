import { useMemo } from "react"

import { LINKS, NAVIGATION, NavigationItem } from "@/config/navigation"
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
      }).map((item) => {
        if (item.key === "staking" && !featureFlags.gigaStakingEnabled) {
          return {
            ...item,
            to: LINKS.stakingOld,
            children: item.children?.filter(
              (child) => child.key !== "stakingGigaStake",
            ),
          }
        }

        return item
      }),
    [featureFlags.hollarBondsEnabled, featureFlags.gigaStakingEnabled],
  )
}
