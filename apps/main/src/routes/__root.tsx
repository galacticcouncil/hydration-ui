import { QueryClient, useQuery } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import {
  createRootRouteWithContext,
  ScrollRestoration,
} from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/router-devtools"
import { lazy } from "react"

import { useAccountBalance, useAccountUniques } from "@/api/account"
import { assetsQuery } from "@/api/assets"
import { useInvalidateOnBlock } from "@/api/chain"
import { useAllPools, useOmnipoolIds } from "@/api/pools"
import { useProviderMetadata } from "@/api/provider"
import { usePriceSubscriber } from "@/api/spotPrice"
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
  const rpcProvider = useRpcProvider()
  useProviderMetadata()
  useOmnipoolIds()
  useInvalidateOnBlock()
  useAccountBalance()
  useAccountUniques()
  usePriceSubscriber()
  useAllPools()
  useQuery(assetsQuery(rpcProvider))
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
      <ScrollRestoration />
      {hasTopNavbar && <ReactQueryDevtools buttonPosition="bottom-left" />}
      {hasTopNavbar && <TanStackRouterDevtools position="bottom-left" />}
      {isApiLoaded && <Subscriptions />}
      {!hasTopNavbar && <MobileTabBar />}
      <ProviderRpcSelect />
      <TransactionManager />
      <Web3ConnectModal />
    </>
  )
}
