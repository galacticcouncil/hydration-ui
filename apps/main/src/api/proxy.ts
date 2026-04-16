import { useAccount } from "@galacticcouncil/web3-connect"
import {
  QueryClient,
  queryOptions,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { millisecondsInMinute } from "date-fns/constants"
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

export const getAccountProxiesQueryKey = (accountAddress: string) => [
  "accountProxies",
  accountAddress,
]
export const getAccountProxies = (
  context: TProviderContext,
  queryClient: QueryClient,
  accountAddress: string,
) =>
  queryOptions({
    queryKey: getAccountProxiesQueryKey(accountAddress),
    queryFn: async () => {
      const allProxies = await queryClient.fetchQuery(getAllProxies(context))

      return filterAccountProxies(allProxies, accountAddress).map((data) =>
        data.keyArgs[0].toString(),
      )
    },
    enabled: context.isApiLoaded && !!accountAddress,
    gcTime: millisecondsInMinute,
    staleTime: millisecondsInMinute,
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
  rpc: TProviderContext,
  proxyAddress: string,
  call: TxCallData,
  withFeePayer?: boolean,
) => {
  const proxyCall = rpc.papi.tx.Proxy.proxy({
    real: proxyAddress,
    call,
    force_proxy_type: Enum("Any"),
  })

  const unsafeApi = rpc.papiClient.getUnsafeApi()

  // TODO: Update descriptors when RT upgrade is released
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dispatchWithFeePayer = (unsafeApi as any).tx?.Dispatcher
    ?.dispatch_with_fee_payer

  if (!dispatchWithFeePayer)
    throw new Error("dispatch_with_fee_payer not found")

  return withFeePayer
    ? dispatchWithFeePayer({
        call: proxyCall.decodedCall,
      })
    : proxyCall
}
