import { Suspense, lazy } from "react"
import { GasStationProvider } from "sections/lending/components/transactions/GasStation/GasStationProvider"
import { BackgroundDataProvider } from "sections/lending/hooks/app-data-provider/BackgroundDataProvider"
import { AppDataProvider } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { ModalContextProvider } from "sections/lending/hooks/useModal"
import { PermissionProvider } from "sections/lending/hooks/usePermissions"
import { Web3ContextProvider } from "sections/lending/libs/web3-data-provider/Web3Provider"
import { SharedDependenciesProvider } from "sections/lending/ui-config/SharedDependenciesProvider"
import { TransactionEventHandler } from "sections/lending/components/TransactionEventHandler"

const BorrowModal = lazy(async () => ({
  default: (
    await import("sections/lending/components/transactions/Borrow/BorrowModal")
  ).BorrowModal,
}))
const ClaimRewardsModal = lazy(async () => ({
  default: (
    await import(
      "sections/lending/components/transactions/ClaimRewards/ClaimRewardsModal"
    )
  ).ClaimRewardsModal,
}))
const CollateralChangeModal = lazy(async () => ({
  default: (
    await import(
      "sections/lending/components/transactions/CollateralChange/CollateralChangeModal"
    )
  ).CollateralChangeModal,
}))
const EmodeModal = lazy(async () => ({
  default: (
    await import("sections/lending/components/transactions/Emode/EmodeModal")
  ).EmodeModal,
}))
const RateSwitchModal = lazy(async () => ({
  default: (
    await import(
      "sections/lending/components/transactions/RateSwitch/RateSwitchModal"
    )
  ).RateSwitchModal,
}))
const RepayModal = lazy(async () => ({
  default: (
    await import("sections/lending/components/transactions/Repay/RepayModal")
  ).RepayModal,
}))
const SupplyModal = lazy(async () => ({
  default: (
    await import("sections/lending/components/transactions/Supply/SupplyModal")
  ).SupplyModal,
}))
const SupplyGigaModal = lazy(async () => ({
  default: (
    await import(
      "sections/lending/components/transactions/Supply/SupplyGigaModal"
    )
  ).SupplyGigaModal,
}))
const WithdrawModal = lazy(async () => ({
  default: (
    await import(
      "sections/lending/components/transactions/Withdraw/WithdrawModal"
    )
  ).WithdrawModal,
}))

export const LendingPageProviders = ({
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
                    <SupplyModal />
                    <SupplyGigaModal />
                    <WithdrawModal />
                    <BorrowModal />
                    <RepayModal />
                    <CollateralChangeModal />
                    <RateSwitchModal />
                    <ClaimRewardsModal />
                    <EmodeModal />
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
