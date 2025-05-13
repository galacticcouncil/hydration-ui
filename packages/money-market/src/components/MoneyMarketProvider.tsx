import { Web3ReactProvider } from "@web3-react/core"
import { providers } from "ethers"
import { lazy, Suspense } from "react"

import { BackgroundDataProvider } from "@/hooks/app-data-provider/BackgroundDataProvider"
import { AppDataProvider } from "@/hooks/app-data-provider/useAppDataProvider"
import { ModalContextProvider } from "@/hooks/useModal"
import { PermissionProvider } from "@/hooks/usePermissions"
import { Web3ContextProvider } from "@/libs/web3-data-provider/Web3Provider"
import { SharedDependenciesProvider } from "@/ui-config/SharedDependenciesProvider"

const SupplyModal = lazy(async () => ({
  default: (await import("@/components/transactions/supply/SupplyModal"))
    .SupplyModal,
}))

const getWeb3Library: React.ComponentPropsWithoutRef<
  typeof Web3ReactProvider
>["getLibrary"] = (provider): providers.Web3Provider => {
  const library = new providers.Web3Provider(provider)
  library.pollingInterval = 12000
  return library
}

export const MoneyMarketProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <Web3ReactProvider getLibrary={getWeb3Library}>
      <BackgroundDataProvider>
        <Web3ContextProvider>
          <PermissionProvider>
            <ModalContextProvider>
              <AppDataProvider>
                <SharedDependenciesProvider>
                  {children}
                  <Suspense>
                    <SupplyModal />
                  </Suspense>
                </SharedDependenciesProvider>
              </AppDataProvider>
            </ModalContextProvider>
          </PermissionProvider>
        </Web3ContextProvider>
      </BackgroundDataProvider>
    </Web3ReactProvider>
  )
}
