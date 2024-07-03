import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { Parachain, SubstrateApis } from "@galacticcouncil/xcm-core"
import { TExternalAsset } from "sections/wallet/addToken/AddToken.utils"

export const assethub = chainsMap.get("assethub") as Parachain

//@ts-ignore
assethub.ws = "ws://172.26.1.70:8000"

export const getAssetHubAssets = async () => {
  try {
    const apiPool = SubstrateApis.getInstance()
    const api = await apiPool.api(assethub.ws)
    const dataRaw = await api.query.assets.metadata.entries()

    const data: TExternalAsset[] = dataRaw.map(([key, dataRaw]) => {
      const id = key.args[0].toString()
      const data = dataRaw

      return {
        id,
        // @ts-ignore
        decimals: data.decimals.toNumber() as number,
        // @ts-ignore
        symbol: data.symbol.toHuman() as string,
        // @ts-ignore
        name: data.name.toHuman() as string,
        origin: assethub.parachainId,
      }
    })

    console.log({ data })
    return { data, id: assethub.parachainId }
  } catch (e) {}
}

/**
 * Used for fetching tokens only from Asset Hub parachain
 */
export const useAssetHubAssetRegistry = () => {
  return useQuery(
    QUERY_KEYS.assetHubAssetRegistry,
    async () => {
      const assetHub = await getAssetHubAssets()

      if (assetHub) {
        return assetHub.data
      }
    },
    {
      retry: false,
      refetchOnWindowFocus: false,
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours,
      staleTime: 1000 * 60 * 60 * 1, // 1 hour
    },
  )
}
