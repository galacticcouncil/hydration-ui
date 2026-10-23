import { isAddressValidOnHydration } from "@galacticcouncil/utils"
import {
  toAccount,
  useWeb3Connect,
  WalletProviderStatus,
} from "@galacticcouncil/web3-connect"
import { WalletProviderType } from "@galacticcouncil/web3-connect/src/config/providers"
import { create } from "zustand"

import { useDepositJourneyStore } from "@/modules/onramp/deposit/store/useDepositJourneyStore"
import { OnrampScreen } from "@/modules/onramp/types"
import { WithdrawAssetSelection } from "@/modules/onramp/withdraw/WithdrawAssetSelect.utils"

import { useOnrampStore } from "./useOnrampStore"

export type DepositFlow = "current" | "preview" | "guided" | "simple"
export type DepositVariant = Exclude<DepositFlow, "current">
export type WithdrawFlow = "current" | "guided" | "simple"

export type OnrampModalType =
  | "deposit"
  | "withdraw"
  | "withdrawCex"
  | "withdrawAsset"
  | "withdrawOnchain"
  | "bankWithdraw"
  | "bankDeposit"
  | "depositOnchain"
  | "depositOnchainPreview"

type OnrampModalState = {
  modal: OnrampModalType | null
  depositFlow: DepositVariant
  withdrawFlow: WithdrawFlow
  withdrawPending: boolean
  withdrawAssetId: string | null
  withdrawSelection: WithdrawAssetSelection | null
  withdrawPage: OnrampScreen
  paginateWithdraw: (page: OnrampScreen) => void
  openWithdraw: () => void
  openWithdrawCex: () => void
  selectWithdrawAsset: (selection: string | WithdrawAssetSelection) => void
  setWithdrawAssetId: (assetId: string | null) => void
  openWithdrawOnchain: (flow?: WithdrawFlow) => void
  setModal: (modal: OnrampModalType | null) => void
  openOnchain: (
    flow: DepositFlow,
    options?: { resume?: boolean; txHash?: string },
  ) => void
}

export const useOnrampModal = create<OnrampModalState>((set, get) => ({
  modal: null,
  depositFlow: "guided",
  withdrawFlow: "guided",
  withdrawPending: false,
  withdrawAssetId: null,
  withdrawSelection: null,
  withdrawPage: OnrampScreen.WithdrawOnchainAsset,
  paginateWithdraw: (withdrawPage) => set({ withdrawPage }),
  openWithdraw: () => {
    useDepositJourneyStore.getState().leave()
    set({ modal: "withdraw", withdrawAssetId: null, withdrawSelection: null })
  },
  openWithdrawCex: () => {
    useDepositJourneyStore.getState().leave()
    set({
      modal: "withdrawCex",
      withdrawAssetId: null,
      withdrawSelection: null,
      withdrawPage: OnrampScreen.WithdrawAssetSelect,
    })
  },
  selectWithdrawAsset: (selection) => {
    const assetId =
      typeof selection === "string" ? selection : selection.assetId
    useDepositJourneyStore.getState().leave()
    set({
      modal: "withdrawOnchain",
      withdrawAssetId: assetId,
      withdrawSelection: typeof selection === "string" ? null : selection,
      withdrawPage: OnrampScreen.WithdrawOnchainForm,
    })
  },
  setWithdrawAssetId: (withdrawAssetId) =>
    set({ withdrawAssetId, withdrawSelection: null }),
  openWithdrawOnchain: (requestedFlow) => {
    if (get().withdrawPending) return
    useDepositJourneyStore.getState().leave()
    const withdrawFlow = requestedFlow ?? get().withdrawFlow
    set({
      modal: withdrawFlow === "current" ? "withdrawOnchain" : "withdrawAsset",
      withdrawFlow,
      withdrawAssetId: null,
      withdrawSelection: null,
      withdrawPage:
        withdrawFlow === "current"
          ? OnrampScreen.WithdrawOnchainWallet
          : OnrampScreen.WithdrawOnchainAsset,
    })
  },
  setModal: (modal) => {
    if (modal !== "depositOnchainPreview")
      useDepositJourneyStore.getState().leave()
    set({ modal })
  },
  openOnchain: (requestedFlow, options) => {
    // Keep existing preview links working while Balance browser is hidden.
    const flow = requestedFlow === "preview" ? "guided" : requestedFlow
    const journey = useDepositJourneyStore.getState()
    if (flow === "current") {
      journey.leave()
      useOnrampStore.getState().paginateTo(OnrampScreen.DepositOnchainWallet)
      set({ modal: "depositOnchain" })
      return
    }

    const wallets = useWeb3Connect.getState()
    const activeAccount = wallets.account ? toAccount(wallets.account) : null
    const suggested =
      activeAccount &&
      activeAccount.canUseOnHydration &&
      activeAccount.provider !== WalletProviderType.ExternalWallet &&
      wallets.getStatus(activeAccount.provider) ===
        WalletProviderStatus.Connected &&
      isAddressValidOnHydration(activeAccount.rawAddress)
        ? activeAccount
        : null
    if (
      journey.destinationAccount &&
      (wallets.getStatus(journey.destinationAccount.provider) !==
        WalletProviderStatus.Connected ||
        !journey.destinationAccount.canUseOnHydration ||
        !wallets.accounts.some(
          (account) =>
            account.provider === journey.destinationAccount?.provider &&
            account.address === journey.destinationAccount?.address,
        ))
    ) {
      useDepositJourneyStore.setState({ destinationConfirmed: false })
    }
    const resumeTransfer =
      journey.pendingTransfers.find(
        (item) => item.txHash === options?.txHash,
      ) ??
      journey.submitted ??
      journey.pendingTransfers.at(-1)
    if (options?.resume && resumeTransfer) {
      useDepositJourneyStore.setState({ submitted: resumeTransfer })
      useDepositJourneyStore.setState({ active: true })
      journey.setPhase("tracking")
    } else {
      journey.start(suggested)
    }
    if (useDepositJourneyStore.getState().phase !== "tracking") {
      if (flow === "guided") journey.setPhase("catalog")
      if (flow === "simple") journey.setPhase("assets")
    }
    set({ modal: "depositOnchainPreview", depositFlow: flow })
  },
}))
