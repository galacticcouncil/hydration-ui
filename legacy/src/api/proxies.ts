import { ApiPromise } from "@polkadot/api"
import { useQuery } from "@tanstack/react-query"
import { useRpcProvider } from "providers/rpcProvider"
import { QUERY_KEYS } from "utils/queryKeys"

export const getProxies = async (api: ApiPromise, address: string) => {
  return await api.query.proxy.proxies(address)
}

export const getDelegates = async (api: ApiPromise, address: string) => {
  const [delegates] = await getProxies(api, address)
  const delegateList = delegates?.map(({ delegate }) => delegate.toString())
  return { isProxy: !!delegates.length, delegates: delegateList ?? [] }
}

export const useExternalWalletDelegates = (address: string) => {
  const { api } = useRpcProvider()
  return useQuery(
    QUERY_KEYS.externalWalletKey(address),
    async () => await getDelegates(api, address),
    { enabled: !!address },
  )
}
