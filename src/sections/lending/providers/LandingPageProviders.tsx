import { Web3ReactProvider } from "@web3-react/core"
import { providers } from "ethers"
import { AppGlobalStyles } from "sections/lending/layouts/AppGlobalStyles"
import { Web3ContextProvider } from "sections/lending/libs/web3-data-provider/Web3Provider"
import { AppDataProvider } from "sections/lending/hooks/app-data-provider/useAppDataProvider"

import { GasStationProvider } from "sections/lending/components/transactions/GasStation/GasStationProvider"
import { BackgroundDataProvider } from "sections/lending/hooks/app-data-provider/BackgroundDataProvider"
import { ModalContextProvider } from "sections/lending/hooks/useModal"
import { PermissionProvider } from "sections/lending/hooks/usePermissions"
import { SharedDependenciesProvider } from "sections/lending/ui-config/SharedDependenciesProvider"
import { AddressBlocked } from "sections/lending/components/AddressBlocked"

function getWeb3Library(provider: any): providers.Web3Provider {
  const library = new providers.Web3Provider(provider)
  library.pollingInterval = 12000
  return library
}

export const LendingPageProviders = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <Web3ReactProvider getLibrary={getWeb3Library}>
      <Web3ContextProvider>
        <AppGlobalStyles>
          <AddressBlocked>
            <PermissionProvider>
              <ModalContextProvider>
                <BackgroundDataProvider>
                  <AppDataProvider>
                    <GasStationProvider>
                      <SharedDependenciesProvider>
                        {children}
                      </SharedDependenciesProvider>
                    </GasStationProvider>
                  </AppDataProvider>
                </BackgroundDataProvider>
              </ModalContextProvider>
            </PermissionProvider>
          </AddressBlocked>
        </AppGlobalStyles>
      </Web3ContextProvider>
    </Web3ReactProvider>
  )
}
