import { Account, useAccount } from "@galacticcouncil/web3-connect"
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { createRootRouteWithContext, HeadContent } from "@tanstack/react-router"
import { lazy, Suspense } from "react"

import { assetsQuery } from "@/api/assets"
import { useInvalidateOnBlock } from "@/api/chain"
import { useSquidClient } from "@/api/provider"
import { usePriceSubscriber } from "@/api/spotPrice"
import { useAccountBalanceSubscription } from "@/api/subscriptions"
import { RouterContext } from "@/App"
import { Footer } from "@/modules/layout/components/Footer"
import { LayoutSkeleton } from "@/modules/layout/components/LayoutSkeleton"
import { useHasTopNavbar } from "@/modules/layout/hooks/useHasTopNavbar"
import { MainLayout } from "@/modules/layout/MainLayout"
import {
  useBasejumpScanSubscription,
  useXcScanSubscription,
} from "@/modules/xcm/history"
import { useProcessBasejumpScanJourneys } from "@/modules/xcm/history/hooks/useProcessBasejumpScanJourneys"
import { AssetsProvider } from "@/providers/assetsProvider"
import { MultisigProvider } from "@/providers/MultisigProvider"
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

const Devtools = import.meta.env.DEV
  ? lazy(async () => ({
      default: await import("@/components/Devtools").then((m) => m.Devtools),
    }))
  : lazy(async () => ({ default: () => null }))

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
          <MultisigProvider>
            <MainLayout />
            <Services />
            <Footer />
            {!hasTopNavbar && <MobileTabBar />}
          </MultisigProvider>
        </RpcProvider>
      </AssetsProvider>
      {hasTopNavbar && (
        <Suspense>
          <Devtools />
        </Suspense>
      )}
    </>
  )
}

function ApiSubscriptions() {
  const rpcProvider = useRpcProvider()
  const queryClient = useQueryClient()

  useInvalidateOnBlock()
  useAccountBalanceSubscription()
  usePriceSubscriber()
  useSuspenseQuery(assetsQuery(rpcProvider, queryClient))

  return null
}

function AccountSubscriptions({ account }: { account: Account }) {
  useXcScanSubscription(account.address)
  useBasejumpScanSubscription(account.address)
  useProcessBasejumpScanJourneys(account.address)

  return null
}

function Services() {
  const squidSdk = useSquidClient()
  const { isConnected, account } = useAccount()
  const { isApiLoaded, papi } = useRpcProvider()
  return (
    <>
      <TransactionManager />
      <Web3ConnectModal squidSdk={squidSdk} papi={papi} />
      {isApiLoaded && <ApiSubscriptions />}
      {isConnected && <AccountSubscriptions account={account} />}
    </>
  )
}
