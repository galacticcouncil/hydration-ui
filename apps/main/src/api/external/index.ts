import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { SubstrateApis } from "@galacticcouncil/xcm-core"
import { useQuery } from "@tanstack/react-query"

import { useAssetHubAssetRegistry } from "@/api/external/assethub"
import { usePendulumAssetRegistry } from "@/api/external/pendulum"
import { TProviderContext } from "@/providers/rpcProvider"
import { assethub, isAnyParachain, pendulum } from "@/utils/externalAssets"

export const useExternalApi = (chainKey: string) => {
  const chain = chainsMap.get(chainKey)

  return useQuery({
    queryKey: ["externalApi", chain],
    queryFn: async () => {
      if (!chain) throw new Error(`Chain ${chainKey} not found`)
      if (!isAnyParachain(chain))
        throw new Error(`Chain ${chainKey} is not a parachain`)

      const apiPool = SubstrateApis.getInstance()
      const api = await apiPool.api(chain.ws)

      return api
    },
    enabled: !!chain,
    retry: false,
    refetchOnWindowFocus: false,
    gcTime: 1000 * 60 * 60 * 24, // 24 hours,
    staleTime: 1000 * 60 * 60 * 1, // 1 hour
  })
}

/**
 * Used for fetching tokens from supported parachains
 */
export const useExternalAssetRegistry = (
  { isLoaded }: TProviderContext,
  enabled?: boolean,
) => {
  const queryEnabled =
    typeof enabled === "boolean" ? enabled && isLoaded : isLoaded

  const assethubRegistry = useAssetHubAssetRegistry(queryEnabled)
  const pendulumRegistry = usePendulumAssetRegistry(queryEnabled)

  return {
    [assethub.parachainId]: assethubRegistry,
    [pendulum.parachainId]: pendulumRegistry,
  }
}

export type TRugCheckData = { warnings: unknown[] }
