import { createContext, useContext } from "react"
import { ApprovedAmountService } from "sections/lending/services/ApprovedAmountService"
import { DelegationTokenService } from "sections/lending/services/DelegationTokenService"
import { GovernanceService } from "sections/lending/services/GovernanceService"
import { GovernanceV3Service } from "sections/lending/services/GovernanceV3Service"
import { UiIncentivesService } from "sections/lending/services/UIIncentivesService"
import { UiPoolService } from "sections/lending/services/UIPoolService"
import { UiStakeDataService } from "sections/lending/services/UiStakeDataService"
import { VotingMachineService } from "sections/lending/services/VotingMachineService"
import { WalletBalanceService } from "sections/lending/services/WalletBalanceService"
import {
  getNetworkConfig,
  getProvider,
} from "sections/lending/utils/marketsAndNetworksConfig"
import invariant from "tiny-invariant"

import { governanceV3Config } from "./governanceConfig"
import { stakeConfig } from "./stakeConfig"

interface SharedDependenciesContext {
  governanceService: GovernanceService
  governanceV3Service: GovernanceV3Service
  votingMachineSerivce: VotingMachineService
  governanceWalletBalanceService: WalletBalanceService
  poolTokensBalanceService: WalletBalanceService
  uiStakeDataService: UiStakeDataService
  approvedAmountService: ApprovedAmountService
  uiIncentivesService: UiIncentivesService
  uiPoolService: UiPoolService
  delegationTokenService: DelegationTokenService
}

const SharedDependenciesContext =
  createContext<SharedDependenciesContext | null>(null)

export const SharedDependenciesProvider: React.FC<{
  children?: React.ReactNode
}> = ({ children }) => {
  const getGovernanceProvider = (chainId: number) => {
    const networkConfig = getNetworkConfig(chainId)
    const isGovernanceFork =
      networkConfig.isFork &&
      networkConfig.underlyingChainId === governanceV3Config.coreChainId
    return isGovernanceFork
      ? getProvider(chainId)
      : getProvider(governanceV3Config.coreChainId)
  }
  const getStakeProvider = (chainId: number) => {
    const networkConfig = getNetworkConfig(chainId)
    const isStakeFork =
      networkConfig.isFork &&
      networkConfig.underlyingChainId === stakeConfig.chainId
    return isStakeFork ? getProvider(chainId) : getProvider(stakeConfig.chainId)
  }

  // services
  const governanceService = new GovernanceService(getGovernanceProvider)
  const governanceV3Service = new GovernanceV3Service()
  const votingMachineSerivce = new VotingMachineService()
  const governanceWalletBalanceService = new WalletBalanceService(
    getGovernanceProvider,
  )
  const poolTokensBalanceService = new WalletBalanceService(getProvider)
  const uiStakeDataService = new UiStakeDataService(getStakeProvider)
  const approvedAmountService = new ApprovedAmountService(getProvider)
  const delegationTokenService = new DelegationTokenService(
    getGovernanceProvider,
  )

  const uiPoolService = new UiPoolService(getProvider)
  const uiIncentivesService = new UiIncentivesService(getProvider)

  return (
    <SharedDependenciesContext.Provider
      value={{
        governanceService,
        governanceV3Service,
        votingMachineSerivce,
        governanceWalletBalanceService,
        poolTokensBalanceService,
        uiStakeDataService,
        approvedAmountService,
        uiPoolService,
        uiIncentivesService,
        delegationTokenService,
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
