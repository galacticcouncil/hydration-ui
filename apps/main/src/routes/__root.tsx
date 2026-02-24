import { Account, useAccount } from "@galacticcouncil/web3-connect"
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { createRootRouteWithContext, HeadContent } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { lazy } from "react"

import { useAccountPermitNonce, useAccountUniques } from "@/api/account"
import { assetsQuery } from "@/api/assets"
import { useInvalidateOnBlock } from "@/api/chain"
import { useSquidClient } from "@/api/provider"
import { usePriceSubscriber } from "@/api/spotPrice"
import { useAccountBalanceSubscription } from "@/api/subscriptions"
import { RouterContext } from "@/App"
import { ProviderRpcSelect } from "@/components/ProviderRpcSelect/ProviderRpcSelect"
import { LayoutSkeleton } from "@/modules/layout/components/LayoutSkeleton"
import { useHasTopNavbar } from "@/modules/layout/hooks/useHasTopNavbar"
import { MainLayout } from "@/modules/layout/MainLayout"
import { useXcScanSubscription } from "@/modules/xcm/history"
import { AssetsProvider } from "@/providers/assetsProvider"
import { RpcProvider, useRpcProvider } from "@/providers/rpcProvider"

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

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  pendingComponent: LayoutSkeleton,
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
  const hasTopNavbar = useHasTopNavbar()

  return (
    <>
      <HeadContent />
      <AssetsProvider>
        <RpcProvider>
          <MainLayout />
          <Services />
          <ProviderRpcSelect />
          {!hasTopNavbar && <MobileTabBar />}
        </RpcProvider>
      </AssetsProvider>
      {hasTopNavbar && <ReactQueryDevtools buttonPosition="bottom-left" />}
      {hasTopNavbar && <TanStackRouterDevtools position="bottom-left" />}
    </>
  )
}

function ApiSubscriptions() {
  const rpcProvider = useRpcProvider()
  const queryClient = useQueryClient()

  useInvalidateOnBlock()
  useAccountBalanceSubscription()
  useAccountUniques()
  usePriceSubscriber()
  useSuspenseQuery(assetsQuery(rpcProvider, queryClient))
  useAccountPermitNonce()

  return null
}

function AccountSubscriptions({ account }: { account: Account }) {
  useXcScanSubscription(account.address)

  return null
}

function Services() {
  const squidSdk = useSquidClient()
  const { isConnected, account } = useAccount()
  const { isApiLoaded } = useRpcProvider()

  return (
    <>
      <TransactionManager />
      <Web3ConnectModal squidSdk={squidSdk} />
      {isApiLoaded && <ApiSubscriptions />}
      {isConnected && <AccountSubscriptions account={account} />}
    </>
  )
}
