import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { createRootRouteWithContext } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { lazy } from "react"

import { useAccountUniquesSubscription } from "@/api/account"
import { assetsQuery } from "@/api/assets"
import { useInvalidateOnBlock } from "@/api/chain"
import { useAllPools, useOmnipoolIds } from "@/api/pools"
import { useProviderMetadata, useSquidClient } from "@/api/provider"
import { usePriceSubscriber } from "@/api/spotPrice"
import { useAccountBalanceSubscription } from "@/api/subscriptions"
import { ProviderRpcSelect } from "@/components/ProviderRpcSelect/ProviderRpcSelect"
import { MainLayout } from "@/modules/layout/MainLayout"
import { useHasTopNavbar } from "@/modules/layout/use-has-top-navbar"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useDisplayAssetStablecoinUpdate } from "@/states/displayAsset"

const MobileTabBar = lazy(async () => ({
  default: await import(
    "@/modules/layout/components/MobileTabBar/MobileTabBar"
  ).then((m) => m.MobileTabBar),
}))

const TransactionManager = lazy(async () => ({
  default: await import("@/modules/transactions/TransactionManager").then(
    (m) => m.TransactionManager,
  ),
}))

const Web3ConnectModal = lazy(async () => ({
  default: await import("@galacticcouncil/web3-connect").then(
    (m) => m.Web3ConnectModal,
  ),
}))

const Subscriptions = () => {
  const queryClient = useQueryClient()
  const rpcProvider = useRpcProvider()
  useProviderMetadata()
  useOmnipoolIds()
  useInvalidateOnBlock()
  useAccountBalanceSubscription()
  useAccountUniquesSubscription()
  usePriceSubscriber()
  useAllPools()
  useQuery(assetsQuery(rpcProvider, queryClient))
  useDisplayAssetStablecoinUpdate()

  return null
}

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: RootComponent,
})

function RootComponent() {
  const { isApiLoaded } = useRpcProvider()
  const hasTopNavbar = useHasTopNavbar()

  return (
    <>
      <MainLayout />
      {hasTopNavbar && <ReactQueryDevtools buttonPosition="bottom-left" />}
      {hasTopNavbar && <TanStackRouterDevtools position="bottom-left" />}
      {isApiLoaded && <Subscriptions />}
      {!hasTopNavbar && <MobileTabBar />}
      <ProviderRpcSelect />
      <TransactionManager />
      <Web3Connect />
    </>
  )
}

function Web3Connect() {
  const squidSdk = useSquidClient()

  return <Web3ConnectModal squidSdk={squidSdk} />
}
