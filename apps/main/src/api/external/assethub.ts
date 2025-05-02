import { arrayToMap } from "@galacticcouncil/utils"
import { ParachainAssetData } from "@galacticcouncil/xcm-core"
import { ApiPromise } from "@polkadot/api"
import { useQuery } from "@tanstack/react-query"

import { useExternalApi } from "@/api/external"
import {
  assethub,
  ASSETHUB_ID_BLACKLIST,
  TExternalAsset,
} from "@/utils/externalAssets"

export const ASSETHUB_XCM_ASSET_SUFFIX = "_ah_"
export const ASSETHUB_TREASURY_ADDRESS =
  "13UVJyLnbVp9RBZYFwFGyDvVd1y27Tt8tkntv6Q7JVPhFsTB"

export const assethubNativeToken = assethub.assetsData.get(
  "dot",
) as ParachainAssetData

export const getAssetHubAssets = async (api: ApiPromise) => {
  try {
    const [dataRaw, assetsRaw] = await Promise.all([
      api.query.assets.metadata.entries(),
      api.query.assets.asset.entries(),
    ])

    const data: TExternalAsset[] = dataRaw.map(([key, dataRaw]) => {
      const id = key.args[0].toString()
      const data = dataRaw

      const asset = assetsRaw.find((asset) => asset[0].args.toString() === id)

      const supply = asset?.[1].unwrap().supply.toString()
      const admin = asset?.[1].unwrap().admin.toString()
      const owner = asset?.[1].unwrap().owner.toString()
      const isWhiteListed =
        admin === ASSETHUB_TREASURY_ADDRESS &&
        owner === ASSETHUB_TREASURY_ADDRESS

      return {
        id,
        decimals: data.decimals.toNumber(),
        // decode from hex because of non-standard characters
        symbol: Buffer.from(data.symbol.toHex().slice(2), "hex").toString(
          "utf8",
        ),
        name: Buffer.from(data.name.toHex().slice(2), "hex").toString("utf8"),
        supply,
        origin: assethub.parachainId,
        isWhiteListed,
      }
    })
    return { data, id: assethub.parachainId }
    // eslint-disable-next-line no-empty
  } catch (e) {}
}

/**
 * Used for fetching tokens only from Asset Hub parachain
 */
export const useAssetHubAssetRegistry = (enabled = true) => {
  const { data: api } = useExternalApi("assethub")

  return useQuery({
    queryKey: ["assetHubAssetRegistry"],
    queryFn: async () => {
      if (!api) throw new Error("Asset Hub is not connected")
      const assetHub = await getAssetHubAssets(api)

      if (assetHub) {
        return assetHub.data
      }
    },
    enabled: enabled && !!api,
    retry: false,
    refetchOnWindowFocus: false,
    gcTime: 1000 * 60 * 60 * 24, // 24 hours,
    staleTime: 1000 * 60 * 60 * 1, // 1 hour
    select: (data) => {
      const assets = data ?? []
      const filteredAssets = assets.filter(
        ({ id }) => !ASSETHUB_ID_BLACKLIST.includes(id),
      )
      return arrayToMap("id", filteredAssets)
    },
  })
}
