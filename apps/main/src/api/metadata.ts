import { AssetMetadataFactory } from "@galacticcouncil/utils"
import { queryOptions, useQuery } from "@tanstack/react-query"

/**
 * Warms the AssetMetadataFactory singleton.
 * The asset registry does not await this, so first paint is not blocked by the CDN.
 * Icon getters return empty strings until the fetch succeeds. A missing manifest
 * throws so React Query can retry; nothing suspends on this query.
 */
export const assetMetadataQuery = () =>
  queryOptions({
    queryKey: ["assetMetadata"],
    queryFn: async () => {
      const metadata = AssetMetadataFactory.getInstance()

      await Promise.all([
        metadata.fetchAssets(),
        metadata.fetchChains(),
        metadata.fetchMetadata(),
      ])

      if (!metadata.isLoaded) {
        throw new Error("Asset metadata manifests unavailable")
      }

      return metadata
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })

/**
 * The metadata singleton, warmed or not. Subscribing here is what re-renders a
 * logo once the CDN responds - the singleton itself never changes identity.
 */
export const useAssetMetadata = () => {
  const { data } = useQuery(assetMetadataQuery())

  return data ?? AssetMetadataFactory.getInstance()
}
