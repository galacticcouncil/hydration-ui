import { Provider as TooltipProvider } from "@radix-ui/react-tooltip"
import { ToastProvider } from "components/Toast/ToastProvider"
import { RpcProvider } from "providers/rpcProvider"
import { FC, PropsWithChildren, lazy } from "react"
import { SkeletonTheme } from "react-loading-skeleton"
import { theme } from "theme"
import * as React from "react"
import * as Apps from "@galacticcouncil/apps"
import { createComponent } from "@lit-labs/react"
import { ProviderResolver } from "sections/provider/ProviderResolver"
import { AssetsProvider } from "providers/assets"
import { BlastCampaignManager } from "sections/blast/BlastCampaignManager"

const AppsContextProvider = createComponent({
  tagName: "gc-context-provider",
  elementClass: Apps.ContextProvider,
  react: React,
})

const ReferralsConnect = lazy(async () => ({
  default: (await import("sections/referrals/ReferralsConnect"))
    .ReferralsConnect,
}))

const Transactions = lazy(async () => ({
  default: (await import("sections/transaction/Transactions")).Transactions,
}))

const Web3Connect = lazy(async () => ({
  default: (await import("sections/web3-connect/Web3Connect")).Web3Connect,
}))

const DepositManager = lazy(async () => ({
  default: (await import("sections/deposit/DepositManager")).DepositManager,
}))

const QuerySubscriptions = lazy(async () => ({
  default: (await import("api/subscriptions")).QuerySubscriptions,
}))

export const AppProviders: FC<PropsWithChildren> = ({ children }) => {
  return (
    <TooltipProvider>
      <ProviderResolver>
        <AssetsProvider>
          <RpcProvider>
            <ToastProvider />
            <SkeletonTheme
              baseColor={`rgba(${theme.rgbColors.white}, 0.12)`}
              highlightColor={`rgba(${theme.rgbColors.white}, 0.24)`}
              borderRadius={4}
            >
              <AppsContextProvider>
                {children} <Services />
              </AppsContextProvider>
            </SkeletonTheme>
          </RpcProvider>
        </AssetsProvider>
      </ProviderResolver>
    </TooltipProvider>
  )
}

const Services = () => (
  <React.Suspense>
    <Web3Connect />
    <Transactions />
    <ReferralsConnect />
    <QuerySubscriptions />
    <DepositManager />
    <BlastCampaignManager />
  </React.Suspense>
)
