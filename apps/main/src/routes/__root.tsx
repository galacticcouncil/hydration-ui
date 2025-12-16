import { useQuery } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { createRootRouteWithContext, HeadContent } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { lazy } from "react"

import { useAccountUniques } from "@/api/account"
import { assetsQuery } from "@/api/assets"
import { useInvalidateOnBlock } from "@/api/chain"
import { useAllPools, useOmnipoolIds } from "@/api/pools"
import {
  providerQuery,
  useProviderMetadata,
  useSquidClient,
} from "@/api/provider"
import { usePriceSubscriber } from "@/api/spotPrice"
import { useAccountBalanceSubscription } from "@/api/subscriptions"
import { RouterContext } from "@/App"
import { Loader } from "@/components/Loader/Loader"
import { ProviderRpcSelect } from "@/components/ProviderRpcSelect/ProviderRpcSelect"
import { RouteError } from "@/components/RouteError"
import { MainLayout } from "@/modules/layout/MainLayout"
import { useHasTopNavbar } from "@/modules/layout/use-has-top-navbar"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useDisplayAssetStablecoinUpdate } from "@/states/displayAsset"
import { useProviderRpcUrlStore } from "@/states/provider"

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
  useAccountBalanceSubscription()
  useAccountUniques()
  usePriceSubscriber()
  useAllPools()
  useQuery(assetsQuery(rpcProvider))
  useDisplayAssetStablecoinUpdate()

  return null
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  pendingComponent: () => {
    return (
      <>
        <Loader />
        <ProviderRpcSelect bottomPinned />
      </>
    )
  },
  beforeLoad: async ({ context }) => {
    const { autoMode, rpcUrlList, rpcUrl } = useProviderRpcUrlStore.getState()

    const rpcProviderUrls = autoMode ? rpcUrlList : [rpcUrl]

    const rpcData = await context.queryClient.ensureQueryData(
      providerQuery(rpcProviderUrls),
    )

    await context.queryClient.ensureQueryData(
      assetsQuery({ ...rpcData, isApiLoaded: true, isLoaded: true }),
    )
  },
  errorComponent: RouteError,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: [
      {
        title: i18n.t("common:meta.title"),
      },
      {
        name: "description",
        content: i18n.t("common:meta.description"),
      },
    ],
  }),
})

function RootComponent() {
  const { isApiLoaded } = useRpcProvider()
  const hasTopNavbar = useHasTopNavbar()

  return (
    <>
      <HeadContent />
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
