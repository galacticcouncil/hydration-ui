import * as React from "react"
import * as Apps from "@galacticcouncil/apps"
import { Provider as TooltipProvider } from "@radix-ui/react-tooltip"
import { useProvider } from "api/provider"
import { InvalidateOnBlock } from "components/InvalidateOnBlock"
import { ToastProvider } from "components/Toast/ToastProvider"
import { FC, PropsWithChildren } from "react"
import { SkeletonTheme } from "react-loading-skeleton"
import { LoadingPage } from "sections/loading/LoadingPage"
import { Transactions } from "sections/transaction/Transactions"
import { theme } from "theme"
import { ApiPromiseContext } from "utils/api"
import { createComponent } from "@lit-labs/react"

const NotificationCenter = createComponent({
  tagName: "gc-notification-center",
  elementClass: Apps.NotificationCenter,
  react: React,
})

const TransactionCenter = createComponent({
  tagName: "gc-transaction-center",
  elementClass: Apps.TransactionCenter,
  react: React,
})

export const AppProviders: FC<PropsWithChildren> = ({ children }) => {
  const api = useProvider()

  if (!api.data) return <LoadingPage />

  return (
    <TooltipProvider>
      <ApiPromiseContext.Provider value={api.data}>
        <InvalidateOnBlock>
          <ToastProvider>
            <SkeletonTheme
              baseColor={`rgba(${theme.rgbColors.white}, 0.12)`}
              highlightColor={`rgba(${theme.rgbColors.white}, 0.24)`}
              borderRadius={4}
            >
              <NotificationCenter>
                <TransactionCenter>{children}</TransactionCenter>
              </NotificationCenter>
              <Transactions />
            </SkeletonTheme>
          </ToastProvider>
        </InvalidateOnBlock>
      </ApiPromiseContext.Provider>
    </TooltipProvider>
  )
}
