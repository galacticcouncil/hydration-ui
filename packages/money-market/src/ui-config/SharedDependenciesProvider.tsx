import { NeckworkClient } from "@galacticcouncil/indexer/neckwork"
import { createContext, useContext } from "react"
import invariant from "tiny-invariant"

import { ApprovedAmountService } from "@/services/ApprovedAmountService"
import { UiIncentivesService } from "@/services/UIIncentivesService"
import { UiPoolService } from "@/services/UIPoolService"
import { WalletBalanceService } from "@/services/WalletBalanceService"
import { UseMaxBalanceFn } from "@/types"
import { getProvider } from "@/utils/provider"

interface SharedDependenciesContextProps {
  poolTokensBalanceService: WalletBalanceService
  approvedAmountService: ApprovedAmountService
  uiIncentivesService: UiIncentivesService
  uiPoolService: UiPoolService
  neckwork: NeckworkClient
  useMaxBalance: UseMaxBalanceFn
  getRelatedATokenId: (id: string) => string | undefined
}

const SharedDependenciesContext =
  createContext<SharedDependenciesContextProps | null>(null)

export const SharedDependenciesProvider: React.FC<{
  children?: React.ReactNode
  neckwork: NeckworkClient
  useMaxBalance: UseMaxBalanceFn
  getRelatedATokenId: (id: string) => string | undefined
}> = ({ children, neckwork, useMaxBalance, getRelatedATokenId }) => {
  const poolTokensBalanceService = new WalletBalanceService(getProvider)
  const approvedAmountService = new ApprovedAmountService(getProvider)

  const uiPoolService = new UiPoolService(getProvider)
  const uiIncentivesService = new UiIncentivesService(getProvider)

  return (
    <SharedDependenciesContext.Provider
      value={{
        poolTokensBalanceService,
        approvedAmountService,
        uiPoolService,
        uiIncentivesService,
        neckwork,
        useMaxBalance,
        getRelatedATokenId,
      }}
    >
      {children}
    </SharedDependenciesContext.Provider>
  )
}

export const useSharedDependencies = () => {
  const context = useContext(SharedDependenciesContext)
  invariant(
    context,
    "Component should be wrapper inside a <SharedDependenciesProvider />",
  )
  return context
}
