import { ApiPromise } from "@polkadot/api"
import { Provider as TooltipProvider } from "@radix-ui/react-tooltip"
import { useProvider, useProviderRpcUrlStore } from "api/provider"
import { InvalidateOnBlock } from "components/InvalidateOnBlock"
import { ToastProvider } from "components/Toast/ToastProvider"
import { FC, PropsWithChildren } from "react"
import { SkeletonTheme } from "react-loading-skeleton"
import { Transactions } from "sections/transaction/Transactions"
import { theme } from "theme"
import { ApiPromiseContext } from "utils/api"
import { WalletConnectProvider } from "utils/walletConnect"

export const AppProviders: FC<PropsWithChildren> = ({ children }) => {
  const preference = useProviderRpcUrlStore()
  const api = useProvider(preference.rpcUrl)

  return (
    <TooltipProvider>
      <ApiPromiseContext.Provider
        value={
          api.data && preference._hasHydrated ? api.data : ({} as ApiPromise)
        }
      >
        <WalletConnectProvider>
          <InvalidateOnBlock>
            <ToastProvider>
              <SkeletonTheme
                baseColor={`rgba(${theme.rgbColors.white}, 0.12)`}
                highlightColor={`rgba(${theme.rgbColors.white}, 0.24)`}
                borderRadius={4}
              >
                {children}
                <Transactions />
              </SkeletonTheme>
            </ToastProvider>
          </InvalidateOnBlock>
        </WalletConnectProvider>
      </ApiPromiseContext.Provider>
    </TooltipProvider>
  )
}
