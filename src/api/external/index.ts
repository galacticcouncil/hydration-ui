import { HYDRA_PARACHAIN_ID } from "utils/constants"
import { pendulum, usePendulumAssetRegistry } from "./pendulum"
import { assethub, useAssetHubAssetRegistry } from "./assethub"
import { usePolkadotRegistry } from "./polkadot"

export {
  pendulum,
  assethub,
  usePendulumAssetRegistry,
  useAssetHubAssetRegistry,
  usePolkadotRegistry,
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
