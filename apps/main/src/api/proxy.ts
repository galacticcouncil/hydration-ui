import { useAccount } from "@galacticcouncil/web3-connect"
import {
  QueryClient,
  queryOptions,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { Enum, TxCallData } from "polkadot-api"

import { Papi, TProviderContext, useRpcProvider } from "@/providers/rpcProvider"

export type TProxy = Awaited<
  ReturnType<Papi["query"]["Proxy"]["Proxies"]["getEntries"]>
>[number]

export const filterAccountProxies = (
  allProxies: Array<TProxy>,
  accountAddress: string,
) => {
  return allProxies.filter((data) => {
    const { value } = data
    const [delegates] = value
    return delegates.some(
      (delegate) => delegate.delegate.toString() === accountAddress,
    )
  })
}

export const getAllProxies = ({ papi, isApiLoaded }: TProviderContext) =>
  queryOptions({
    queryKey: ["allProxies"],
    queryFn: async () => {
      return await papi.query.Proxy.Proxies.getEntries({ at: "best" })
    },
    enabled: isApiLoaded,
  })

export const getAccountProxies = (
  context: TProviderContext,
  queryClient: QueryClient,
  accountAddress: string,
) =>
  queryOptions({
    queryKey: ["accountProxies", accountAddress],
    queryFn: async () => {
      const allProxies = await queryClient.ensureQueryData(
        getAllProxies(context),
      )
      return filterAccountProxies(allProxies, accountAddress).map((data) =>
        data.keyArgs[0].toString(),
      )
    },
    enabled: context.isApiLoaded && !!accountAddress,
  })

export const useAccountProxies = () => {
  const context = useRpcProvider()
  const { account } = useAccount()
  const queryClient = useQueryClient()

  return useQuery(
    getAccountProxies(context, queryClient, account?.address ?? ""),
  )
}

export const createProxyFeesQuery = ({ papi, isApiLoaded }: TProviderContext) =>
  queryOptions({
    queryKey: ["createProxyFees"],
    queryFn: async () => {
      const [proxyDepositBase, proxyDepositFactor] = await Promise.all([
        papi.constants.Proxy.ProxyDepositBase(),
        papi.constants.Proxy.ProxyDepositFactor(),
      ])

      return {
        proxyDepositBase,
        proxyDepositFactor,
      }
    },
    enabled: isApiLoaded,
    gcTime: Infinity,
    staleTime: Infinity,
  })

export const createProxyCall = (
  papi: Papi,
  proxyAddress: string,
  call: TxCallData,
  withFeePayer?: boolean,
) => {
  const proxyCall = papi.tx.Proxy.proxy({
    real: proxyAddress,
    call,
    force_proxy_type: Enum("Any"),
  })

  return withFeePayer
    ? papi.tx.Dispatcher.dispatch_with_fee_payer({
        call: proxyCall.decodedCall,
      })
    : proxyCall
}
