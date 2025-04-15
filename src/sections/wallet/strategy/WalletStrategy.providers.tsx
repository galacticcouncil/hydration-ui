import { Web3ReactProvider } from "@web3-react/core"
import { providers } from "ethers"
import { lazy, Suspense } from "react"
import { GasStationProvider } from "sections/lending/components/transactions/GasStation/GasStationProvider"
import { BackgroundDataProvider } from "sections/lending/hooks/app-data-provider/BackgroundDataProvider"
import { AppDataProvider } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { PermissionProvider } from "sections/lending/hooks/usePermissions"
import { Web3ContextProvider } from "sections/lending/libs/web3-data-provider/Web3Provider"
import { SharedDependenciesProvider } from "sections/lending/ui-config/SharedDependenciesProvider"
import { TransactionEventHandler } from "sections/lending/components/TransactionEventHandler"
import { ModalContextProvider } from "sections/lending/hooks/useModal"

const ClaimRewardsModal = lazy(async () => ({
  default: (
    await import(
      "sections/lending/components/transactions/ClaimRewards/ClaimRewardsModal"
    )
  ).ClaimRewardsModal,
}))

function getWeb3Library(provider: any): providers.Web3Provider {
  const library = new providers.Web3Provider(provider)
  library.pollingInterval = 12000
  return library
}

export const WalletStrategyProviders = ({
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
                <GasStationProvider>
                  <SharedDependenciesProvider>
                    {children}
                    <Suspense>
                      <ClaimRewardsModal />
                      <TransactionEventHandler />
                    </Suspense>
                  </SharedDependenciesProvider>
                </GasStationProvider>
              </AppDataProvider>
            </ModalContextProvider>
          </PermissionProvider>
        </Web3ContextProvider>
      </BackgroundDataProvider>
    </Web3ReactProvider>
  )
}
