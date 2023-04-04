import { Provider as TooltipProvider } from "@radix-ui/react-tooltip"
import { useProvider, useProviderRpcUrlStore } from "api/provider"
import { InvalidateOnBlock } from "components/InvalidateOnBlock"
import { ToastProvider } from "components/Toast/ToastProvider"
import { FC, PropsWithChildren } from "react"
import { SkeletonTheme } from "react-loading-skeleton"
import { LoadingPage } from "sections/loading/LoadingPage"
import { Transactions } from "sections/transaction/Transactions"
import { theme } from "theme"
import { ApiPromiseContext } from "utils/api"
import { GcTransactionCenter } from "sections/gcapps/TransactionCenter"

export const AppProviders: FC<PropsWithChildren> = ({ children }) => {
  const preference = useProviderRpcUrlStore()
  const api = useProvider(preference.rpcUrl)

  if (!preference._hasHydrated || !api.data) return <LoadingPage />

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
              <GcTransactionCenter>{children}</GcTransactionCenter>
              <Transactions />
            </SkeletonTheme>
          </ToastProvider>
        </InvalidateOnBlock>
      </ApiPromiseContext.Provider>
    </TooltipProvider>
  )
}
