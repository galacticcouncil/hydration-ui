import { getHostnameFromUrl } from "@galacticcouncil/utils"
import { useMemo } from "react"

import { getProviderProps } from "@/api/rpcConfig"
import { createProvider, ProviderProps } from "@/config/rpc"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useRpcListStore } from "@/states/provider"

export const useActiveProviderProps = (): ProviderProps | null => {
  const { endpoint } = useRpcProvider()
  const { rpcList } = useRpcListStore()

  return useMemo(() => {
    if (!endpoint) return null

    const known = getProviderProps(endpoint)
    if (known) return known

    const custom = rpcList.find((rpc) => rpc.url === endpoint)
    return createProvider(
      custom?.name ?? getHostnameFromUrl(endpoint),
      endpoint,
    )
  }, [endpoint, rpcList])
}
