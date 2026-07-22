import { useMemo } from "react"

import { LINKS, NAVIGATION, NavigationItem } from "@/config/navigation"
import { useRpcProvider } from "@/providers/rpcProvider"

export const useNavigation = (): NavigationItem[] => {
  const { featureFlags } = useRpcProvider()

  return useMemo(
    () =>
      NAVIGATION.filter((item) => item.enabled !== false).map((item) => {
        if (item.key === "strategies") {
          return {
            ...item,
            children: item.children?.filter((child) => {
              if (child.key === "strategiesBil") {
                return featureFlags.bilEnabled
              }
              if (child.key === "strategiesPropeller") {
                return featureFlags.propellerEnabled
              }
              if (child.key === "strategiesHollarBonds") {
                return featureFlags.hollarBondsEnabled
              }
              return true
            }),
          }
        }

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
    [
      featureFlags.bilEnabled,
      featureFlags.hollarBondsEnabled,
      featureFlags.gigaStakingEnabled,
      featureFlags.propellerEnabled,
    ],
  )
}
