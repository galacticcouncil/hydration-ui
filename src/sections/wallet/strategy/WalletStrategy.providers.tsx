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

export const WalletStrategyProviders = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
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
  )
}
