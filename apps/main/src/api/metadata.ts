import { AssetMetadataFactory } from "@galacticcouncil/utils"
import { queryOptions, useQuery } from "@tanstack/react-query"

/**
 * Warms the AssetMetadataFactory singleton from the metadata CDN.
 *
 * Deliberately not part of the provider query: a third-party CDN must not sit
 * on the path to first render. Every getter on the singleton returns an empty
 * string (or the default metadata) until this resolves, and the fetches
 * swallow their own failures, so an unreachable CDN costs icons, not a boot.
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
