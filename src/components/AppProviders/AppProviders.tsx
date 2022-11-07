import { LoadingPage } from "sections/loading/LoadingPage"
import { InvalidateOnBlock } from "components/InvalidateOnBlock"
import { ApiPromiseContext } from "utils/api"
import { FC, PropsWithChildren } from "react"
import { useProvider } from "api/provider"
import { ToastProvider } from "components/Toast/ToastProvider"
import { Transactions } from "sections/transaction/Transactions"
import { Provider as TooltipProvider } from "@radix-ui/react-tooltip"
import { SkeletonTheme } from "react-loading-skeleton"
import { theme } from "theme"

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
              borderRadius={9999}
            >
              {children}
              <Transactions />
            </SkeletonTheme>
          </ToastProvider>
        </InvalidateOnBlock>
      </ApiPromiseContext.Provider>
    </TooltipProvider>
  )
}
