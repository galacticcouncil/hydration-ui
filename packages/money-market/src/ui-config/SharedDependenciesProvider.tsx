import { createContext, useContext } from "react"
import invariant from "tiny-invariant"

import { ApprovedAmountService } from "@/services/ApprovedAmountService"
import { UiIncentivesService } from "@/services/UIIncentivesService"
import { UiPoolService } from "@/services/UIPoolService"
import { WalletBalanceService } from "@/services/WalletBalanceService"
import { getProvider } from "@/utils/provider"

interface SharedDependenciesContextProps {
  poolTokensBalanceService: WalletBalanceService
  approvedAmountService: ApprovedAmountService
  uiIncentivesService: UiIncentivesService
  uiPoolService: UiPoolService
}

const SharedDependenciesContext =
  createContext<SharedDependenciesContextProps | null>(null)

export const SharedDependenciesProvider: React.FC<{
  children?: React.ReactNode
}> = ({ children }) => {
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
