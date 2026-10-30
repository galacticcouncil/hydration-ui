import { Account } from "@galacticcouncil/web3-connect"
import { WalletProviderType } from "@galacticcouncil/web3-connect/src/config/providers"
import type { XcJourney } from "@galacticcouncil/xc-scan"
import { create } from "zustand"
import { persist } from "zustand/middleware"

export type DepositAssetIntent = { chainKey: string; assetKey: string }

export type DepositPhase =
  | "catalog"
  | "sources"
  | "destination"
  | "assets"
  | "amount"
  | "tracking"
export type DepositSelection = {
  account: Account
  chainKey: string
  assetKey: string
}
export type SubmittedDeposit = {
  txHash: string
  sourceAddress: string
  destinationAddress: string
  sourceChainKey: string
  symbol: string
  amount: string
  receivedAmount: string
  receivedSymbol: string
  receivedAssetKey?: string
  bridgeTag?: string | null
  destinationName?: string
  destinationProvider?: WalletProviderType
  sourceProvider?: WalletProviderType
  sentAt: number
  optimistic?: XcJourney
  settled: boolean
  claimable?: boolean
  error?: string
}

type DepositJourneyStore = {
  active: boolean
  phase: DepositPhase
  checkSavedSources: boolean
  destinationAddress: string
  destinationAccount: Account | null
  suggestedDestinationAccount: Account | null
  destinationConfirmed: boolean
  pendingTransfers: SubmittedDeposit[]
  assetIntent: DepositAssetIntent | null
  selection: DepositSelection | null
  amount: string
  submitted: SubmittedDeposit | null
  start: (activeAccount?: Account | null) => void
  leave: () => void
  setPhase: (phase: DepositPhase) => void
  setDestination: (
    address: string,
    account: Account | null,
    options?: { stayOnSources?: boolean },
  ) => void
  setAssetIntent: (intent: DepositAssetIntent) => void
  discoverAssets: () => void
  setSelection: (
    selection: DepositSelection,
    options?: { stayOnSources?: boolean },
  ) => void
  setAmount: (amount: string) => void
  setSubmitted: (submitted: SubmittedDeposit) => void
  updateSubmitted: (update: Partial<SubmittedDeposit>, txHash?: string) => void
  checkedSources: () => void
  retry: () => void
  depositMore: () => void
}
const initial = {
  active: false,
  phase: "sources" as DepositPhase,
  checkSavedSources: true,
  destinationAddress: "",
  destinationAccount: null,
  suggestedDestinationAccount: null as Account | null,
  destinationConfirmed: false,
  pendingTransfers: [] as SubmittedDeposit[],
  assetIntent: null,
  selection: null,
  amount: "",
  submitted: null,
}

export const useDepositJourneyStore = create<DepositJourneyStore>()(
  persist(
    (set, get) => ({
      ...initial,
      start: (activeAccount) => {
        const previous = get()
        if (previous.submitted && !previous.submitted.settled) {
          set({ active: true, phase: "tracking" })
          return
        }
        set({
          ...initial,
          active: true,
          pendingTransfers: previous.pendingTransfers,
          suggestedDestinationAccount: activeAccount ?? null,
          ...(previous.destinationConfirmed &&
          previous.destinationAccount &&
          (!activeAccount?.canUseOnHydration ||
            (previous.destinationAccount.provider === activeAccount.provider &&
              previous.destinationAccount.address === activeAccount.address))
            ? {
                destinationAddress: previous.destinationAddress,
                destinationAccount: previous.destinationAccount,
                destinationConfirmed: true,
              }
            : {}),
        })
      },
      leave: () => set({ active: false }),
      setPhase: (phase) => set({ phase, checkSavedSources: false }),
      checkedSources: () => set({ checkSavedSources: false }),
      setDestination: (
        destinationAddress,
        destinationAccount,
        { stayOnSources = false } = {},
      ) =>
        set({
          destinationAddress,
          destinationAccount,
          destinationConfirmed: true,
          phase: stayOnSources
            ? "sources"
            : get().selection
              ? "amount"
              : "assets",
        }),
      setAssetIntent: (assetIntent) =>
        set({
          assetIntent,
          selection: null,
          amount: "",
          phase: "sources",
          checkSavedSources: false,
        }),
      discoverAssets: () =>
        set({
          assetIntent: null,
          selection: null,
          amount: "",
          phase: "sources",
          checkSavedSources: true,
        }),
      setSelection: (selection, { stayOnSources = false } = {}) =>
        set({
          selection,
          assetIntent: {
            chainKey: selection.chainKey,
            assetKey: selection.assetKey,
          },
          amount:
            get().selection?.assetKey === selection.assetKey
              ? get().amount
              : "",
          ...(stayOnSources ? { destinationConfirmed: false } : {}),
          phase: stayOnSources
            ? "sources"
            : get().destinationConfirmed
              ? "amount"
              : "destination",
        }),
      setAmount: (amount) => set({ amount }),
      setSubmitted: (submitted) =>
        set((state) => ({
          submitted,
          phase: "tracking",
          pendingTransfers: [
            ...state.pendingTransfers.filter(
              (item) => item.txHash !== submitted.txHash,
            ),
            submitted,
          ],
        })),
      updateSubmitted: (update, txHash = get().submitted?.txHash) =>
        set((state) => ({
          submitted:
            state.submitted && state.submitted.txHash === txHash
              ? { ...state.submitted, ...update }
              : state.submitted,
          pendingTransfers: state.pendingTransfers
            .map((item) =>
              item.txHash === txHash ? { ...item, ...update } : item,
            )
            .filter((item) => !item.settled),
        })),
      retry: () =>
        set({ submitted: null, phase: get().selection ? "amount" : "assets" }),
      depositMore: () =>
        set({
          active: true,
          phase: "assets",
          assetIntent: null,
          selection: null,
          amount: "",
          submitted: null,
        }),
    }),
    {
      name: "deposit-journey-v1",
      version: 3,
      migrate: (persisted) => {
        if (!persisted || typeof persisted !== "object") return initial
        return {
          ...initial,
          ...persisted,
          assetIntent: null,
          destinationConfirmed: false,
          pendingTransfers:
            "submitted" in persisted &&
            persisted.submitted &&
            typeof persisted.submitted === "object" &&
            !("settled" in persisted.submitted && persisted.submitted.settled)
              ? [persisted.submitted]
              : [],
          phase:
            "submitted" in persisted && persisted.submitted
              ? ("tracking" as const)
              : ("sources" as const),
        }
      },
    },
  ),
)
