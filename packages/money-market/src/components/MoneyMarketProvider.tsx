import { ExternalProvider, Web3Provider } from "@ethersproject/providers"
import { NeckworkClient } from "@galacticcouncil/indexer/neckwork"
import { FC, lazy, Suspense, useEffect } from "react"
import { useShallow } from "zustand/shallow"

import { BackgroundDataProvider } from "@/hooks/app-data-provider/BackgroundDataProvider"
import { AppDataProvider } from "@/hooks/app-data-provider/useAppDataProvider"
import {
  AppFormattersProvider,
  AppFormattersProvidersContextType,
} from "@/hooks/app-data-provider/useAppFormatters"
import type { SwapRateProvider as SwapRateProviderApi } from "@/hooks/paraswap/common"
import { SwapRateProvider } from "@/hooks/paraswap/useSwapRateProvider"
import { ModalContextProvider } from "@/hooks/useModal"
import { PermissionProvider } from "@/hooks/usePermissions"
import { Web3ContextProvider } from "@/libs/web3-data-provider/Web3Provider"
import { useRootStore } from "@/store/root"
import {
  AssetLogoComponent,
  ExternalApyData,
  MoneyMarketTxFn,
  UseMaxBalanceFn,
} from "@/types"
import { SharedDependenciesProvider } from "@/ui-config/SharedDependenciesProvider"
import { CustomMarket } from "@/utils"

const SupplyModal = lazy(async () => ({
  default: (await import("@/components/transactions/supply/SupplyModal"))
    .SupplyModal,
}))

const WithdrawModal = lazy(async () => ({
  default: (await import("@/components/transactions/withdraw/WithdrawModal"))
    .WithdrawModal,
}))

const BorrowModal = lazy(async () => ({
  default: (await import("@/components/transactions/borrow/BorrowModal"))
    .BorrowModal,
}))

const RepayModal = lazy(async () => ({
  default: (await import("@/components/transactions/repay/RepayModal"))
    .RepayModal,
}))

const CollateralChangeModal = lazy(async () => ({
  default: (
    await import("@/components/transactions/collateral/CollateralChangeModal")
  ).CollateralChangeModal,
}))

const EmodeModal = lazy(async () => ({
  default: (await import("@/components/transactions/emode/EmodeModal"))
    .EmodeModal,
}))

const ClaimRewardsModal = lazy(async () => ({
  default: (await import("@/components/transactions/claim/ClaimRewardsModal"))
    .ClaimRewardsModal,
}))

const SwapModal = lazy(async () => ({
  default: (await import("@/components/transactions/Swap/SwapModal")).SwapModal,
}))

const DebtSwitchModal = lazy(async () => ({
  default: (
    await import("@/components/transactions/DebtSwitch/DebtSwitchModal")
  ).DebtSwitchModal,
}))

export type MoneyMarketProviderProps = AppFormattersProvidersContextType & {
  children: React.ReactNode
  provider: ExternalProvider
  market: CustomMarket
  neckwork: NeckworkClient
  onCreateTransaction: MoneyMarketTxFn
  useMaxBalance: UseMaxBalanceFn
  getRelatedATokenId: (id: string) => string | undefined
  AssetLogo: AssetLogoComponent
  externalApyData: ExternalApyData
  swapSlippage: number
  onSwapModalOpenChange: (open: boolean) => void
  swapRateProvider?: SwapRateProviderApi
}

export const MoneyMarketProvider: FC<MoneyMarketProviderProps> = ({
  children,
  market,
  onCreateTransaction,
  useMaxBalance,
  getRelatedATokenId,
  AssetLogo,
  provider: externalProvider,
  neckwork,
  externalApyData,
  swapSlippage,
  onSwapModalOpenChange,
  swapRateProvider,
  ...formatters
}) => {
  const provider = useRootStore((state) => state.provider)
  const [setProvider, setCurrentMarket] = useRootStore(
    useShallow((state) => [state.setProvider, state.setCurrentMarket]),
  )

  useEffect(() => {
    if (!externalProvider) return
    if (!provider) {
      setProvider(new Web3Provider(externalProvider))
    }
  }, [externalProvider, provider, setProvider])

  useEffect(() => {
    setCurrentMarket(market)
  }, [market, setCurrentMarket])

  if (!provider) return null

  return (
    <AppFormattersProvider {...formatters}>
      <BackgroundDataProvider>
        <Web3ContextProvider onCreateTransaction={onCreateTransaction}>
          <PermissionProvider>
            <ModalContextProvider>
              <AppDataProvider externalApyData={externalApyData}>
                <SharedDependenciesProvider
                  neckwork={neckwork}
                  useMaxBalance={useMaxBalance}
                  getRelatedATokenId={getRelatedATokenId}
                  AssetLogo={AssetLogo}
                >
                  <SwapRateProvider
                    swapRateProvider={swapRateProvider}
                    swapSlippage={swapSlippage}
                    onSwapModalOpenChange={onSwapModalOpenChange}
                  >
                    {children}
                    <Suspense>
                      <SupplyModal />
                      <WithdrawModal />
                      <BorrowModal />
                      <RepayModal />
                      <CollateralChangeModal />
                      <EmodeModal />
                      <ClaimRewardsModal />
                      <SwapModal />
                      <DebtSwitchModal />
                    </Suspense>
                  </SwapRateProvider>
                </SharedDependenciesProvider>
              </AppDataProvider>
            </ModalContextProvider>
          </PermissionProvider>
        </Web3ContextProvider>
      </BackgroundDataProvider>
    </AppFormattersProvider>
  )
}
