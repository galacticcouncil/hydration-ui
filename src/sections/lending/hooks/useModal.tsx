import { ChainId, InterestRate, Stake } from "@aave/contract-helpers"
import { createContext, useContext, useState } from "react"
import { EmodeModalType } from "sections/lending/components/transactions/Emode/EmodeModalContent"
import { useWeb3Context } from "sections/lending/libs/hooks/useWeb3Context"
import { TxErrorType } from "sections/lending/ui-config/errorMapping"
import { EnhancedProposal } from "./governance/useProposal"

export enum ModalType {
  Supply,
  Withdraw,
  Borrow,
  Repay,
  CollateralChange,
  RateSwitch,
  Stake,
  Unstake,
  StakeCooldown,
  StakeRewardClaim,
  ClaimRewards,
  Emode,
  Faucet,
  Swap,
  DebtSwitch,
  GovDelegation,
  GovVote,
  V3Migration,
  RevokeGovDelegation,
  StakeRewardsClaimRestake,
  Switch,
  GovRepresentatives,
}

export interface ModalArgsType {
  underlyingAsset?: string
  proposal?: EnhancedProposal
  support?: boolean
  power?: string
  icon?: string
  stakeAssetName?: Stake
  currentRateMode?: InterestRate
  emode?: EmodeModalType
  isFrozen?: boolean
  representatives?: Array<{ chainId: ChainId; representative: string }>
}

export type TxStateType = {
  txHash?: string
  // txError?: string;
  loading?: boolean
  success?: boolean
}

export interface ModalContextType<T extends ModalArgsType> {
  openSupply: (underlyingAsset: string) => void
  openWithdraw: (underlyingAsset: string) => void
  openBorrow: (underlyingAsset: string) => void
  openRepay: (
    underlyingAsset: string,
    currentRateMode: InterestRate,
    isFrozen: boolean,
  ) => void
  openCollateralChange: (underlyingAsset: string) => void
  openRateSwitch: (
    underlyingAsset: string,
    currentRateMode: InterestRate,
  ) => void
  openStake: (stakeAssetName: Stake, icon: string) => void
  openUnstake: (stakeAssetName: Stake, icon: string) => void
  openStakeCooldown: (stakeAssetName: Stake) => void
  openStakeRewardsClaim: (stakeAssetName: Stake, icon: string) => void
  openStakeRewardsRestakeClaim: (stakeAssetName: Stake, icon: string) => void
  openClaimRewards: () => void
  openEmode: (mode: EmodeModalType) => void
  openFaucet: (underlyingAsset: string) => void
  openSwap: (underlyingAsset: string) => void
  openDebtSwitch: (
    underlyingAsset: string,
    currentRateMode: InterestRate,
  ) => void
  openGovDelegation: () => void
  openRevokeGovDelegation: () => void
  openV3Migration: () => void
  openGovVote: (
    proposal: EnhancedProposal,
    support: boolean,
    power: string,
  ) => void
  openSwitch: (underlyingAsset?: string) => void
  openGovRepresentatives: (
    representatives: Array<{ chainId: ChainId; representative: string }>,
  ) => void
  close: () => void
  type?: ModalType
  args: T
  mainTxState: TxStateType
  approvalTxState: TxStateType
  setApprovalTxState: (data: TxStateType) => void
  setMainTxState: (data: TxStateType) => void
  gasLimit: string
  setGasLimit: (limit: string) => void
  loadingTxns: boolean
  setLoadingTxns: (loading: boolean) => void
  txError: TxErrorType | undefined
  setTxError: (error: TxErrorType | undefined) => void
}

export const ModalContext = createContext<ModalContextType<ModalArgsType>>(
  {} as ModalContextType<ModalArgsType>,
)

export const ModalContextProvider: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const { setSwitchNetworkError } = useWeb3Context()
  // contains the current modal open state if any
  const [type, setType] = useState<ModalType>()
  // contains arbitrary key-value pairs as a modal context
  const [args, setArgs] = useState<ModalArgsType>({})
  const [approvalTxState, setApprovalTxState] = useState<TxStateType>({})
  const [mainTxState, setMainTxState] = useState<TxStateType>({})
  const [gasLimit, setGasLimit] = useState<string>("")
  const [loadingTxns, setLoadingTxns] = useState(false)
  const [txError, setTxError] = useState<TxErrorType>()

  return (
    <ModalContext.Provider
      value={{
        openSupply: (underlyingAsset) => {
          setType(ModalType.Supply)
          setArgs({ underlyingAsset })
        },
        openWithdraw: (underlyingAsset) => {
          setType(ModalType.Withdraw)
          setArgs({ underlyingAsset })
        },
        openBorrow: (underlyingAsset) => {
          setType(ModalType.Borrow)
          setArgs({ underlyingAsset })
        },
        openRepay: (underlyingAsset, currentRateMode, isFrozen) => {
          setType(ModalType.Repay)
          setArgs({ underlyingAsset, currentRateMode, isFrozen })
        },
        openCollateralChange: (underlyingAsset) => {
          setType(ModalType.CollateralChange)
          setArgs({ underlyingAsset })
        },
        openRateSwitch: (underlyingAsset, currentRateMode) => {
          setType(ModalType.RateSwitch)
          setArgs({ underlyingAsset, currentRateMode })
        },
        openStake: (stakeAssetName, icon) => {
          setType(ModalType.Stake)
          setArgs({ stakeAssetName, icon })
        },
        openUnstake: (stakeAssetName, icon) => {
          setType(ModalType.Unstake)
          setArgs({ stakeAssetName, icon })
        },
        openStakeCooldown: (stakeAssetName) => {
          setType(ModalType.StakeCooldown)
          setArgs({ stakeAssetName })
        },
        openStakeRewardsClaim: (stakeAssetName, icon) => {
          setType(ModalType.StakeRewardClaim)
          setArgs({ stakeAssetName, icon })
        },
        openStakeRewardsRestakeClaim: (stakeAssetName, icon) => {
          setType(ModalType.StakeRewardsClaimRestake)
          setArgs({ stakeAssetName, icon })
        },
        openClaimRewards: () => {
          setType(ModalType.ClaimRewards)
        },
        openEmode: (mode) => {
          setType(ModalType.Emode)
          setArgs({ emode: mode })
        },
        openFaucet: (underlyingAsset) => {
          setType(ModalType.Faucet)
          setArgs({ underlyingAsset })
        },
        openSwap: (underlyingAsset) => {
          setType(ModalType.Swap)
          setArgs({ underlyingAsset })
        },
        openDebtSwitch: (underlyingAsset, currentRateMode) => {
          setType(ModalType.DebtSwitch)
          setArgs({ underlyingAsset, currentRateMode })
        },
        openGovDelegation: () => {
          setType(ModalType.GovDelegation)
        },
        openRevokeGovDelegation: () => {
          setType(ModalType.RevokeGovDelegation)
        },
        openGovVote: (proposal, support, power) => {
          setType(ModalType.GovVote)
          setArgs({ proposal, support, power })
        },
        openGovRepresentatives: (representatives) => {
          setType(ModalType.GovRepresentatives)
          setArgs({ representatives })
        },
        openV3Migration: () => {
          setType(ModalType.V3Migration)
        },
        openSwitch: (underlyingAsset) => {
          setType(ModalType.Switch)
          setArgs({ underlyingAsset })
        },
        close: () => {
          setType(undefined)
          setArgs({})
          setMainTxState({})
          setApprovalTxState({})
          setGasLimit("")
          setTxError(undefined)
          setSwitchNetworkError(undefined)
        },
        type,
        args,
        approvalTxState,
        mainTxState,
        setApprovalTxState,
        setMainTxState,
        gasLimit,
        setGasLimit,
        loadingTxns,
        setLoadingTxns,
        txError,
        setTxError,
      }}
    >
      {children}
    </ModalContext.Provider>
  )
}

export const useModalContext = () => {
  const context = useContext(ModalContext)

  if (context === undefined) {
    throw new Error("useModalContext must be used within a ModalProvider")
  }

  return context
}
