import { updateQueryString } from "@galacticcouncil/utils"
import { produce } from "immer"
import { omit, uniqueBy } from "remeda"
import { create } from "zustand"
import { persist } from "zustand/middleware"

import { Web3ConnectModalPage } from "@/config/modal"
import { WalletProviderType } from "@/config/providers"
import {
  COMPATIBLE_WALLET_PROVIDERS,
  PROVIDERS_BY_WALLET_MODE,
  WalletMode,
} from "@/config/wallet"
import { getUniqueAccountKey } from "@/utils/wallet"
import {
  getConflictingWalletProviders,
  getExclusiveWalletProviderTypes,
} from "@/utils/walletSource"
import { ExternalWallet, getWallet, getWallets } from "@/wallets"
import { BaseSubstrateWallet } from "@/wallets/BaseSubstrateWallet"

export enum WalletProviderStatus {
  Connected = "connected",
  Pending = "pending",
  Disconnected = "disconnected",
  Error = "error",
}

export enum WalletRestoreState {
  Restoring = "restoring",
  Unavailable = "unavailable",
}

export { WalletMode } from "@/config/wallet"

export { COMPATIBLE_WALLET_PROVIDERS, PROVIDERS_BY_WALLET_MODE }

export type StoredAccount = {
  name: string
  publicKey: string
  address: string
  rawAddress: string
  provider: WalletProviderType
  delegate?: string
  balance?: number
  isMultisig?: boolean
  multisigConfigId?: string
  multisigSignerAddress?: string
}

export type Account = StoredAccount & {
  displayAddress: string
  canUseOnHydration: boolean
}

export type Web3ConnectModalMeta = {
  closable?: boolean
  title?: string
  description?: string
  hideAccountFilters?: boolean
  hideExternalWallet?: boolean
  hideMultisig?: boolean
  initialPage?: Web3ConnectModalPage
  initialProvider?: WalletProviderType
}

export type WalletProviderEntry = {
  type: WalletProviderType
  status: WalletProviderStatus
}

// Providers, not brands. Talisman alone is four entries.
const RECENT_PROVIDERS_LIMIT = 8

export type WalletProviderState = {
  open: boolean
  providers: WalletProviderEntry[]
  recentProvider: WalletProviderType | null
  recentlyUsedProviders: WalletProviderType[]
  account: StoredAccount | null
  accounts: StoredAccount[]
  mode: WalletMode
  error?: string
  meta?: Web3ConnectModalMeta | null
  restoreStates: Partial<Record<WalletProviderType, WalletRestoreState>>
}

export type WalletProviderStore = WalletProviderState & {
  toggle: (mode?: WalletMode, meta?: Web3ConnectModalMeta) => void
  setAccount: (account: StoredAccount | null) => void
  setAccounts: (accounts: StoredAccount[], type: WalletProviderType) => void
  connectProvider: (accounts: StoredAccount[], type: WalletProviderType) => void
  cancelPendingProvider: (type: WalletProviderType) => void
  normalizeProviders: () => void
  setBalances: (balances: ReadonlyMap<string, number>) => void
  setStatus: (
    provider: WalletProviderType | null,
    status: WalletProviderStatus,
  ) => void
  getStatus: (provider: WalletProviderType | null) => WalletProviderStatus
  markRecent: (provider: WalletProviderType) => void
  getProviders: (mode: WalletMode) => WalletProviderEntry[]
  getConnectedProviders: (mode: WalletMode) => WalletProviderEntry[]
  setError: (error: string) => void
  setRestoreState: (
    provider: WalletProviderType,
    restoreState: WalletRestoreState,
  ) => void
  clearRestoreState: (provider: WalletProviderType) => void
  disconnect: (provider?: WalletProviderType) => void
}

const initialState: WalletProviderState = {
  open: false,
  providers: [],
  recentProvider: null,
  recentlyUsedProviders: [],
  account: null,
  accounts: [],
  mode: WalletMode.Default,
  error: "",
  meta: null,
  restoreStates: {},
}

export const useWeb3Connect = create<WalletProviderStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      toggle: (mode, meta) =>
        set((state) => {
          const isValidMode = mode && Object.values(WalletMode).includes(mode)
          return {
            ...state,
            mode: isValidMode ? mode : WalletMode.Default,
            open: !state.open,
            meta: meta ?? null,
          }
        }),
      setAccounts: (accounts, type) =>
        set((state) => {
          const otherAccounts = state.accounts.filter(
            (a) => a.provider !== type,
          )

          const newAccounts = uniqueBy(
            [...otherAccounts, ...accounts],
            getUniqueAccountKey,
          )

          return {
            ...state,
            accounts: newAccounts,
          }
        }),
      connectProvider: (accounts, type) =>
        set((state) => {
          const conflicts = getConflictingWalletProviders(getWallets(), type)
          const remainingAccounts = state.accounts.filter(
            (account) =>
              account.provider !== type &&
              !conflicts.includes(account.provider),
          )
          const activeSignerAddress = state.account?.isMultisig
            ? state.account.multisigSignerAddress
            : state.account?.address
          const replacesActive =
            !!state.account &&
            (conflicts.includes(state.account.provider) ||
              (state.account.provider === type &&
                !accounts.some(
                  (account) => account.address === activeSignerAddress,
                )))
          return {
            accounts: uniqueBy(
              [...remainingAccounts, ...accounts],
              getUniqueAccountKey,
            ),
            providers: [
              ...state.providers.filter(
                (provider) =>
                  provider.type !== type && !conflicts.includes(provider.type),
              ),
              { type, status: WalletProviderStatus.Connected },
            ],
            account: replacesActive
              ? (accounts[0] ?? remainingAccounts[0] ?? null)
              : state.account,
            restoreStates: omit(state.restoreStates, [...conflicts, type]),
            recentProvider: type,
            error: "",
          }
        }),
      cancelPendingProvider: (type) =>
        set((state) => {
          if (state.getStatus(type) !== WalletProviderStatus.Pending)
            return state
          const accounts = state.accounts.filter(
            (account) => account.provider !== type,
          )
          return {
            providers: state.providers.filter(
              (provider) => provider.type !== type,
            ),
            accounts,
            account:
              state.account?.provider === type
                ? (accounts[0] ?? null)
                : state.account,
            restoreStates: omit(state.restoreStates, [type]),
          }
        }),
      normalizeProviders: () =>
        set((state) => {
          const connected = state.providers
            .filter(
              (provider) => provider.status === WalletProviderStatus.Connected,
            )
            .map((provider) => provider.type)
          const retained = getExclusiveWalletProviderTypes(
            getWallets(),
            connected,
            [
              ...(state.account ? [state.account.provider] : []),
              ...state.recentlyUsedProviders,
              ...(state.recentProvider ? [state.recentProvider] : []),
            ],
          )
          const removed = connected.filter((type) => !retained.includes(type))
          if (!removed.length) return state
          const accounts = state.accounts.filter(
            (account) => !removed.includes(account.provider),
          )
          return {
            providers: state.providers.filter(
              (provider) => !removed.includes(provider.type),
            ),
            accounts,
            account:
              state.account && removed.includes(state.account.provider)
                ? (accounts[0] ?? null)
                : state.account,
            restoreStates: omit(state.restoreStates, removed),
          }
        }),
      setAccount: (account) => {
        const shouldDeactivateExternal =
          !account || account.provider !== WalletProviderType.ExternalWallet

        if (account) {
          const wallet = getWallet(account.provider)
          if (wallet instanceof BaseSubstrateWallet) {
            // For multisig accounts, sign with the signer address, not the multisig address.
            const signerAddress = account.isMultisig
              ? (account.multisigSignerAddress ?? account.address)
              : account.address
            wallet.setSigner(signerAddress)
          }
        }

        if (shouldDeactivateExternal) {
          updateQueryString("account", undefined)
          const externalWallet = getWallet(WalletProviderType.ExternalWallet)
          if (externalWallet instanceof ExternalWallet) {
            externalWallet.disconnect()
          }
        }

        return set((state) => ({
          ...state,
          account,
          ...(shouldDeactivateExternal
            ? {
                providers: state.providers.filter(
                  (p) => p.type !== WalletProviderType.ExternalWallet,
                ),
                accounts: state.accounts.filter(
                  (a) => a.provider !== WalletProviderType.ExternalWallet,
                ),
              }
            : {}),
        }))
      },
      setBalances: (balances) => {
        return set((state) =>
          produce(state, ({ accounts }) => {
            for (const account of accounts) {
              const balance = balances.get(account.publicKey)

              if (balance !== undefined) {
                account.balance = balance
              }
            }
          }),
        )
      },
      setStatus: (provider, status) => {
        const isError = status === WalletProviderStatus.Error
        return set((state) => ({
          ...state,
          providers: provider
            ? [
                ...state.providers.filter((p) => p.type !== provider),
                { type: provider, status },
              ]
            : state.providers,
          recentProvider: provider,
          account:
            isError && state.account?.provider === provider
              ? null
              : state.account,
          error: isError ? state.error : "",
        }))
      },
      getStatus: (provider) => {
        const foundProvider = get().providers.find((p) => p.type === provider)
        return foundProvider?.status ?? WalletProviderStatus.Disconnected
      },
      markRecent: (provider) =>
        set((state) => ({
          ...state,
          recentlyUsedProviders: uniqueBy(
            [provider, ...state.recentlyUsedProviders],
            (type) => type,
          ).slice(0, RECENT_PROVIDERS_LIMIT),
        })),
      getProviders: (mode: WalletMode) => {
        const { providers } = get()
        const providersByMode = PROVIDERS_BY_WALLET_MODE[mode]
        return providers.filter(
          ({ type }) =>
            !providersByMode.length || providersByMode.includes(type),
        )
      },
      getConnectedProviders: (mode: WalletMode) => {
        const { getProviders } = get()
        const providers = getProviders(mode)
        return providers.filter(
          ({ status }) => status === WalletProviderStatus.Connected,
        )
      },
      setError: (error) => set((state) => ({ ...state, error })),
      setRestoreState: (provider, restoreState) =>
        set((state) => ({
          ...state,
          restoreStates: { ...state.restoreStates, [provider]: restoreState },
        })),
      clearRestoreState: (provider) =>
        set((state) => ({
          ...state,
          restoreStates: omit(state.restoreStates, [provider]),
        })),
      disconnect: (givenProvider) => {
        const provider = Object.values(WalletProviderType).find(
          (type) => type === givenProvider,
        )

        set((state) => {
          const isDisconnectingActive =
            !provider || provider === state.account?.provider
          const remainingAccounts = provider
            ? state.accounts.filter((a) => a.provider !== provider)
            : []
          const remainingProviders = provider
            ? state.providers.filter((p) => p.type !== provider)
            : []
          const nextAccount = isDisconnectingActive
            ? (remainingAccounts[0] ?? null)
            : state.account

          if (nextAccount) {
            const wallet = getWallet(nextAccount.provider)
            if (wallet instanceof BaseSubstrateWallet) {
              const signerAddress = nextAccount.isMultisig
                ? (nextAccount.multisigSignerAddress ?? nextAccount.address)
                : nextAccount.address
              wallet.setSigner(signerAddress)
            }
          }

          return {
            ...state,
            ...initialState,
            account: nextAccount,
            accounts: remainingAccounts,
            providers: remainingProviders,
            restoreStates: provider
              ? omit(state.restoreStates, [provider])
              : {},
            recentProvider: null,
            recentlyUsedProviders: state.recentlyUsedProviders,
            mode: state.mode,
            open: state.open,
          }
        })
      },
    }),
    {
      name: "web3-connect",
      partialize: omit([
        "open",
        "error",
        "accounts",
        "mode",
        "meta",
        "restoreStates",
      ]),
      version: 11,
      // v11: seed MRU from recentProvider + recentlyDisconnectedProviders.
      migrate: (persisted, version) => {
        if (version >= 11) return persisted as WalletProviderStore

        const { recentlyDisconnectedProviders, ...state } = (persisted ??
          {}) as WalletProviderStore & {
          recentlyDisconnectedProviders?: WalletProviderType[]
        }

        return {
          ...state,
          recentlyUsedProviders: uniqueBy(
            [
              ...(state.recentProvider ? [state.recentProvider] : []),
              ...(recentlyDisconnectedProviders ?? []),
            ],
            (type) => type,
          ).slice(0, RECENT_PROVIDERS_LIMIT),
        }
      },
    },
  ),
)
