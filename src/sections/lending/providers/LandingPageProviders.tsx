import { Web3ReactProvider } from "@web3-react/core"
import { providers } from "ethers"
import { Suspense, lazy } from "react"
import { AddressBlocked } from "sections/lending/components/AddressBlocked"
import { GasStationProvider } from "sections/lending/components/transactions/GasStation/GasStationProvider"
import { BackgroundDataProvider } from "sections/lending/hooks/app-data-provider/BackgroundDataProvider"
import { AppDataProvider } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { ModalContextProvider } from "sections/lending/hooks/useModal"
import { PermissionProvider } from "sections/lending/hooks/usePermissions"
import { AppGlobalStyles } from "sections/lending/layouts/AppGlobalStyles"
import { Web3ContextProvider } from "sections/lending/libs/web3-data-provider/Web3Provider"
import { SharedDependenciesProvider } from "sections/lending/ui-config/SharedDependenciesProvider"
import { TransactionEventHandler } from "sections/lending/components/TransactionEventHandler"

const SwitchModal = lazy(async () => ({
  default: (
    await import("sections/lending/components/transactions/Switch/SwitchModal")
  ).SwitchModal,
}))

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
const DebtSwitchModal = lazy(async () => ({
  default: (
    await import(
      "sections/lending/components/transactions/DebtSwitch/DebtSwitchModal"
    )
  ).DebtSwitchModal,
}))
const EmodeModal = lazy(async () => ({
  default: (
    await import("sections/lending/components/transactions/Emode/EmodeModal")
  ).EmodeModal,
}))
const FaucetModal = lazy(async () => ({
  default: (
    await import("sections/lending/components/transactions/Faucet/FaucetModal")
  ).FaucetModal,
}))
const MigrateV3Modal = lazy(async () => ({
  default: (
    await import(
      "sections/lending/components/transactions/MigrateV3/MigrateV3Modal"
    )
  ).MigrateV3Modal,
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
const SwapModal = lazy(async () => ({
  default: (
    await import("sections/lending/components/transactions/Swap/SwapModal")
  ).SwapModal,
}))
const WithdrawModal = lazy(async () => ({
  default: (
    await import(
      "sections/lending/components/transactions/Withdraw/WithdrawModal"
    )
  ).WithdrawModal,
}))

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
                        <Suspense>
                          <SupplyModal />
                          <WithdrawModal />
                          <BorrowModal />
                          <RepayModal />
                          <CollateralChangeModal />
                          <RateSwitchModal />
                          <DebtSwitchModal />
                          <ClaimRewardsModal />
                          <EmodeModal />
                          <SwapModal />
                          <FaucetModal />
                          <MigrateV3Modal />
                          <TransactionEventHandler />
                          <SwitchModal />
                        </Suspense>
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
