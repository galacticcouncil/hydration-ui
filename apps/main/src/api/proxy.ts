import { useAccount } from "@galacticcouncil/web3-connect"
import { queryOptions, useQuery } from "@tanstack/react-query"
import { millisecondsInMinute } from "date-fns/constants"
import { Enum, TxCallData } from "polkadot-api"

import { TProviderContext, useRpcProvider } from "@/providers/rpcProvider"

export const getAccountProxiesQueryKey = (accountAddress: string) => [
  "accountProxies",
  accountAddress,
]
export const getAccountProxies = (
  { papiClient, isApiLoaded }: TProviderContext,
  accountAddress: string,
) =>
  queryOptions({
    queryKey: getAccountProxiesQueryKey(accountAddress),
    queryFn: async () => {
      try {
        // @TODO: Update descriptors when RT upgrade is released
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const unsafeApi = papiClient.getUnsafeApi() as any
        const proxies = (await unsafeApi.apis.ProxyApi.proxies_for_delegate(
          accountAddress,
        )) as [string, string, number][]

        return proxies.map(([address]) => address)
      } catch {
        return []
      }
    },
    enabled: isApiLoaded && !!accountAddress,
    gcTime: millisecondsInMinute,
    staleTime: millisecondsInMinute,
  })

export const useAccountProxies = () => {
  const context = useRpcProvider()
  const { account } = useAccount()

  return useQuery(getAccountProxies(context, account?.address ?? ""))
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
