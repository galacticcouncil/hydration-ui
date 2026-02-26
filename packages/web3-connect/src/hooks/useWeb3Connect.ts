import { produce } from "immer"
import { omit, uniqueBy } from "remeda"
import { create } from "zustand"
import { persist } from "zustand/middleware"

import {
  EVM_PROVIDERS,
  SOLANA_PROVIDERS,
  SUBSTRATE_H160_PROVIDERS,
  SUBSTRATE_PROVIDERS,
  SUI_PROVIDERS,
  WalletProviderType,
} from "@/config/providers"
import { getUniqueAccountKey } from "@/utils"
import { getWallet } from "@/wallets"
import { BaseSubstrateWallet } from "@/wallets/BaseSubstrateWallet"

export enum WalletProviderStatus {
  Connected = "connected",
  Pending = "pending",
  Disconnected = "disconnected",
  Error = "error",
}

export enum WalletMode {
  Default = "default",
  EVM = "evm",
  Substrate = "substrate",
  SubstrateEVM = "substrate-evm",
  SubstrateH160 = "substrate-h160",
  Solana = "solana",
  Sui = "sui",
  Unknown = "unknown",
}

export const COMPATIBLE_WALLET_PROVIDERS: WalletProviderType[] = [
  ...SUBSTRATE_PROVIDERS,
  ...EVM_PROVIDERS,
]

export const PROVIDERS_BY_WALLET_MODE: Record<
  WalletMode,
  WalletProviderType[]
> = {
  [WalletMode.Default]: COMPATIBLE_WALLET_PROVIDERS,
  [WalletMode.EVM]: EVM_PROVIDERS,
  [WalletMode.Substrate]: SUBSTRATE_PROVIDERS,
  [WalletMode.SubstrateEVM]: [...SUBSTRATE_PROVIDERS, ...EVM_PROVIDERS],
  [WalletMode.SubstrateH160]: SUBSTRATE_H160_PROVIDERS,
  [WalletMode.Solana]: SOLANA_PROVIDERS,
  [WalletMode.Sui]: SUI_PROVIDERS,
  [WalletMode.Unknown]: [],
}

export type StoredAccount = {
  name: string
  publicKey: string
  address: string
  rawAddress: string
  provider: WalletProviderType
  delegate?: string
  balance?: number
}

export type Account = StoredAccount & {
  displayAddress: string
  isIncompatible?: boolean
}

type Web3ConnectModalMeta = {
  title?: string
  description?: string
}

export type WalletProviderEntry = {
  type: WalletProviderType
  status: WalletProviderStatus
}

export type WalletProviderState = {
  open: boolean
  providers: WalletProviderEntry[]
  recentProvider: WalletProviderType | null
  account: StoredAccount | null
  accounts: StoredAccount[]
  mode: WalletMode
  error?: string
  meta?: Web3ConnectModalMeta | null
}

export type WalletProviderStore = WalletProviderState & {
  toggle: (mode?: WalletMode, meta?: Web3ConnectModalMeta) => void
  setAccount: (account: StoredAccount | null) => void
  setAccounts: (accounts: StoredAccount[], type: WalletProviderType) => void
  setBalances: (balances: ReadonlyMap<string, number>) => void
  setStatus: (
    provider: WalletProviderType | null,
    status: WalletProviderStatus,
  ) => void
  getStatus: (provider: WalletProviderType | null) => WalletProviderStatus
  getProviders: (mode: WalletMode) => WalletProviderEntry[]
  getConnectedProviders: (mode: WalletMode) => WalletProviderEntry[]
  setError: (error: string) => void
  disconnect: (provider?: WalletProviderType) => void
}

const initialState: WalletProviderState = {
  open: false,
  providers: [],
  recentProvider: null,
  account: null,
  accounts: [],
  mode: WalletMode.Default,
  error: "",
  meta: null,
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
      setAccount: (account) => {
        if (account) {
          const wallet = getWallet(account.provider)
          if (wallet instanceof BaseSubstrateWallet) {
            wallet.setSigner(account.address)
          }
        }
        return set((state) => ({ ...state, account }))
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
          account: isError ? null : state.account,
          error: isError ? state.error : "",
        }))
      },
      getStatus: (provider) => {
        const foundProvider = get().providers.find((p) => p.type === provider)
        return foundProvider?.status ?? WalletProviderStatus.Disconnected
      },
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
      disconnect: (givenProvider) => {
        const provider = Object.values(WalletProviderType).find(
          (type) => type === givenProvider,
        )

        set((state) => ({
          ...state,
          ...initialState,
          account:
            !provider || provider === state.account?.provider
              ? null
              : state.account,
          accounts: provider
            ? state.accounts.filter((a) => a.provider !== provider)
            : [],
          providers: provider
            ? state.providers.filter((p) => p.type !== provider)
            : [],
          recentProvider: null,
          mode: state.mode,
          open: state.open,
        }))
      },
    }),
    {
      name: "web3-connect",
      partialize: omit(["open", "error", "accounts"]),
      version: 10,
    },
  ),
)
