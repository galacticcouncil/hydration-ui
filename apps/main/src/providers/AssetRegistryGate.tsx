import {
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { ReactNode } from "react"

import { assetsQuery } from "@/api/assets"
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

export const AssetRegistryGate = ({ children }: { children: ReactNode }) => {
  const { assets } = useAssetRegistry()
  const isCached = assets.length > 0

  return (
    <>
      {isCached ? <CachedAssetRegistry /> : <FreshAssetRegistry />}
      {children}
    </>
  )
}
