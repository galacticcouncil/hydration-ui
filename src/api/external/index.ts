import { HYDRA_PARACHAIN_ID } from "utils/constants"
import { pendulum, usePendulumAssetRegistry } from "./pendulum"
import { assethub, useAssetHubAssetRegistry } from "./assethub"
import { usePolkadotRegistry } from "./polkadot"
import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { SubstrateApis } from "@galacticcouncil/xcm-core"
import { isAnyParachain } from "utils/helpers"

export {
  pendulum,
  assethub,
  usePendulumAssetRegistry,
  useAssetHubAssetRegistry,
  usePolkadotRegistry,
}

export const useExternalApi = (chainKey: string) => {
  const chain = chainsMap.get(chainKey)

  return useQuery(
    QUERY_KEYS.externalApi(chainKey),
    async () => {
      if (!chain) throw new Error(`Chain ${chainKey} not found`)
      if (!isAnyParachain(chain))
        throw new Error(`Chain ${chainKey} is not a parachain`)

      const apiPool = SubstrateApis.getInstance()
      const api = await apiPool.api(chain.ws)

      return api
    },
    {
      enabled: !!chain,
      retry: false,
      refetchOnWindowFocus: false,
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours,
      staleTime: 1000 * 60 * 60 * 1, // 1 hour
    },
  )
}

/**
 * Used for fetching tokens from supported parachains
 */
export const useExternalAssetRegistry = (enabled?: boolean) => {
  const assethubRegistry = useAssetHubAssetRegistry(enabled)
  const pendulumRegistry = usePendulumAssetRegistry(enabled)

  return {
    [assethub.parachainId]: assethubRegistry,
    [pendulum.parachainId]: pendulumRegistry,
  }
}

export const useParachainAmount = (id: string) => {
  const chains = usePolkadotRegistry()

  const validChains = chains.data?.reduce<any[]>((acc, chain) => {
    // skip asst hub and hydra chains
    if (
      chain.paraID === assethub.parachainId ||
      chain.paraID === HYDRA_PARACHAIN_ID
    )
      return acc

    const assets = chain.data

    const isAsset = assets.some((asset) => {
      try {
        return asset.currencyID === id
      } catch (error) {
        return false
      }
    })

    if (isAsset) {
      acc.push(chain)
    }

    return acc
  }, [])

  return { chains: validChains ?? [], amount: validChains?.length ?? 0 }
}
