import { isAddressValidOnHydration } from "@galacticcouncil/utils"
import {
  toAccount,
  useWeb3Connect,
  WalletProviderStatus,
} from "@galacticcouncil/web3-connect"
import { WalletProviderType } from "@galacticcouncil/web3-connect/src/config/providers"
import { create } from "zustand"

import {
  DepositAssetIntent,
  useDepositJourneyStore,
} from "@/modules/onramp/deposit/store/useDepositJourneyStore"
import { OnrampScreen } from "@/modules/onramp/types"
import { WithdrawAssetSelection } from "@/modules/onramp/withdraw/WithdrawAssetSelect.utils"

import { useOnrampStore } from "./useOnrampStore"

export type DepositWalletFirstFlow = "current" | "connected"
export type DepositFlow =
  | DepositWalletFirstFlow
  | "preview"
  | "guided"
  | "simple"
export type DepositVariant = Exclude<DepositFlow, DepositWalletFirstFlow>
export type DepositEntryFlow = Exclude<DepositFlow, "preview"> | "choice"
export type WithdrawFlow = "current" | "guided" | "simple" | "connected"

export const isWalletFirstWithdrawFlow = (flow: WithdrawFlow) =>
  flow === "current" || flow === "connected"

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
  depositEntryChoice: boolean
  depositEntryFlow: DepositEntryFlow
  setDepositEntryFlow: (flow: DepositEntryFlow) => void
  openSelectedDepositFlow: () => void
  openDepositChoice: () => void
  walletFirstFlow: DepositWalletFirstFlow
  walletFirstAsset: DepositAssetIntent | null
  setWalletFirstAsset: (selection: DepositAssetIntent | null) => void
  withdrawFlow: WithdrawFlow
  withdrawPending: boolean
  walletContentWidth: string | null
  setWalletContentWidth: (width: string | null) => void
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
    options?: {
      resume?: boolean
      txHash?: string
      assetIntent?: DepositAssetIntent
      entryChoice?: boolean
    },
  ) => void
}

export const useOnrampModal = create<OnrampModalState>((set, get) => ({
  modal: null,
  depositFlow: "guided",
  depositEntryChoice: true,
  depositEntryFlow: "choice",
  setDepositEntryFlow: (flow) =>
    set({ depositEntryFlow: flow, depositEntryChoice: flow === "choice" }),
  openSelectedDepositFlow: () => {
    const flow = get().depositEntryFlow
    get().openOnchain(flow === "choice" ? "connected" : flow, {
      entryChoice: flow === "choice",
    })
  },
  openDepositChoice: () => {
    useDepositJourneyStore.getState().leave()
    useOnrampStore.getState().paginateTo(OnrampScreen.MethodSelect)
    set({
      modal: "deposit",
      depositEntryChoice: true,
      depositEntryFlow: "choice",
      walletFirstAsset: null,
    })
  },
  walletFirstFlow: "current",
  walletFirstAsset: null,
  setWalletFirstAsset: (walletFirstAsset) => set({ walletFirstAsset }),
  withdrawFlow: "guided",
  withdrawPending: false,
  walletContentWidth: null,
  setWalletContentWidth: (walletContentWidth) => set({ walletContentWidth }),
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
      modal: isWalletFirstWithdrawFlow(withdrawFlow)
        ? "withdrawOnchain"
        : "withdrawAsset",
      withdrawFlow,
      withdrawAssetId: null,
      withdrawSelection: null,
      withdrawPage: isWalletFirstWithdrawFlow(withdrawFlow)
        ? OnrampScreen.WithdrawOnchainWallet
        : OnrampScreen.WithdrawOnchainAsset,
    })
  },
  setModal: (modal) => {
    if (modal !== "depositOnchainPreview")
      useDepositJourneyStore.getState().leave()
    set({
      modal,
      ...(modal === "deposit"
        ? { depositEntryFlow: "choice", depositEntryChoice: true }
        : {}),
      ...(modal !== "depositOnchain" ? { walletFirstAsset: null } : {}),
    })
  },
  openOnchain: (requestedFlow, options) => {
    // Keep existing preview links working while Balance browser is hidden.
    const flow = requestedFlow === "preview" ? "guided" : requestedFlow
    set({
      depositEntryFlow:
        options?.entryChoice === true &&
        (flow === "connected" || flow === "simple")
          ? "choice"
          : flow,
      depositEntryChoice:
        options?.entryChoice === true &&
        (flow === "connected" || flow === "simple"),
    })
    const journey = useDepositJourneyStore.getState()
    if (flow === "current" || flow === "connected") {
      journey.leave()
      useOnrampStore.getState().paginateTo(OnrampScreen.DepositOnchainWallet)
      set({
        modal: "depositOnchain",
        walletFirstFlow: flow,
        walletFirstAsset: options?.assetIntent ?? null,
      })
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
      if (options?.assetIntent) journey.setAssetIntent(options.assetIntent)
      else if (flow === "guided") journey.setPhase("catalog")
      else if (flow === "simple") journey.setPhase("assets")
    }
    set({ modal: "depositOnchainPreview", depositFlow: flow })
  },
}))
