import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { Web3ConnectModal } from "@galacticcouncil/web3-connect"
import { QueryClient, useQuery } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import {
  createRootRouteWithContext,
  ScrollRestoration,
} from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/router-devtools"
import { lazy } from "react"

import { assetsQuery } from "@/api/assets"
import { usePriceSubscriber } from "@/api/spotPrice"
import { ProviderRpcSelect } from "@/components/ProviderRpcSelect/ProviderRpcSelect"
import { MainLayout } from "@/modules/layout/MainLayout"
import { useRpcProvider } from "@/providers/rpcProvider"

const MobileTabBar = lazy(async () => ({
  default: await import("@/modules/layout/components/MobileTabBar").then(
    (m) => m.MobileTabBar,
  ),
}))

const Subscriptions = () => {
  const rpcProvider = useRpcProvider()

  usePriceSubscriber()
  useQuery(assetsQuery(rpcProvider))

  return null
}

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: RootComponent,
})

function RootComponent() {
  const { isApiLoaded } = useRpcProvider()
  const { isDesktop } = useBreakpoints()

  return (
    <main sx={{ overflow: "auto" }}>
      <MainLayout />
      <ScrollRestoration />
      {isDesktop && <ReactQueryDevtools buttonPosition="bottom-left" />}
      {isDesktop && <TanStackRouterDevtools position="bottom-left" />}
      {isApiLoaded && <Subscriptions />}
      {isDesktop ? <ProviderRpcSelect /> : <MobileTabBar />}
      <Web3ConnectModal />
    </main>
  )
}
