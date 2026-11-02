import {
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { ReactNode, useEffect } from "react"

import { assetsQuery, assetsQueryKey } from "@/api/assets"
import { assetMetadataQuery } from "@/api/metadata"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAssetRegistry } from "@/states/assetRegistry"

function CachedAssetRegistry() {
  const rpcProvider = useRpcProvider()
  const queryClient = useQueryClient()

  useQuery(assetsQuery(rpcProvider, queryClient))

  return null
}

function FreshAssetRegistry() {
  const rpcProvider = useRpcProvider()
  const queryClient = useQueryClient()

  useSuspenseQuery(assetsQuery(rpcProvider, queryClient))

  return null
}

/**
 * The registry is mapped without waiting on the metadata CDN. If it was mapped
 * before the metadata query succeeded, re-run it once so the icons fill in.
 * Failed metadata attempts never trigger it.
 */
function AssetMetadataRefresh() {
  const rpcProvider = useRpcProvider()
  const queryClient = useQueryClient()
  const { dataEnv } = rpcProvider

  const { data: registry } = useQuery(assetsQuery(rpcProvider, queryClient))
  const { isSuccess: isMetadataLoaded } = useQuery(assetMetadataQuery())

  const isMappedWithoutMetadata = registry?.isMetadataLoaded === false

  useEffect(() => {
    if (isMetadataLoaded && isMappedWithoutMetadata) {
      queryClient.invalidateQueries({ queryKey: assetsQueryKey(dataEnv) })
    }
  }, [isMetadataLoaded, isMappedWithoutMetadata, queryClient, dataEnv])

  return null
}

export const AssetRegistryGate = ({ children }: { children: ReactNode }) => {
  const { assets, genesisHash: storedGenesisHash } = useAssetRegistry()
  const { genesisHash } = useRpcProvider()

  // Assets cached for a different chain are useless - fall through to the
  // suspense branch so the registry is refetched for the connected chain.
  const isCached = assets.length > 0 && storedGenesisHash === genesisHash

  return (
    <>
      {isCached ? <CachedAssetRegistry /> : <FreshAssetRegistry />}
      <AssetMetadataRefresh />
      {children}
    </>
  )
}
