import { WalletProviderType } from "sections/web3-connect/Web3Connect.utils"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { omit } from "utils/rx"
import {
  EVM_PROVIDERS,
  SUBSTRATE_H160_PROVIDERS,
  SUBSTRATE_PROVIDERS,
} from "sections/web3-connect/constants/providers"

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
}

export type Account = {
  name: string
  address: string
  displayAddress?: string
  genesisHash?: `0x${string}`
  provider: WalletProviderType
  isExternalWalletConnected?: boolean
  delegate?: string
}
type WalletProviderMeta = {
  chain: string
}
type WalletProviderEntry = {
  type: WalletProviderType
  status: WalletProviderStatus
}
type WalletProviderState = {
  open: boolean
  providers: WalletProviderEntry[]
  recentProvider: WalletProviderType | null
  account: Account | null
  mode: WalletMode
  error?: string
  meta?: WalletProviderMeta | null
}

type WalletProviderStore = WalletProviderState & {
  toggle: (mode?: WalletMode, meta?: WalletProviderMeta) => void
  setAccount: (account: Account | null) => void
  setStatus: (
    provider: WalletProviderType | null,
    status: WalletProviderStatus,
  ) => void
  getStatus: (provider: WalletProviderType | null) => WalletProviderStatus
  getActiveProviders: () => WalletProviderEntry[]
  setError: (error: string) => void
  disconnect: (provider?: WalletProviderType) => void
}

const initialState: WalletProviderState = {
  open: false,
  providers: [],
  recentProvider: null,
  account: null,
  mode: WalletMode.Default,
  error: "",
  meta: null,
}

export const useWeb3ConnectStore = create<WalletProviderStore>()(
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
      setAccount: (account) => set((state) => ({ ...state, account })),
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
      getActiveProviders: () => {
        const { mode, providers } = get()
        return providers.filter(({ type }) => {
          if (mode === WalletMode.EVM) {
            return EVM_PROVIDERS.includes(type)
          }

          if (mode === WalletMode.Substrate) {
            return SUBSTRATE_PROVIDERS.includes(type)
          }

          if (mode === WalletMode.SubstrateH160) {
            return SUBSTRATE_H160_PROVIDERS.includes(type)
          }

          if (mode === WalletMode.SubstrateEVM) {
            return [...EVM_PROVIDERS, ...SUBSTRATE_PROVIDERS].includes(type)
          }

          return true
        })
      },
      setError: (error) => set((state) => ({ ...state, error })),
      disconnect: (provider) => {
        set((state) => ({
          ...state,
          ...initialState,
          account: provider === state.account?.provider ? null : state.account,
          providers: provider
            ? state.providers.filter((p) => p.type !== provider)
            : [],
          recentProvider: null,
          open: state.open,
        }))
      },
    }),
    {
      name: "web3-connect",
      partialize: (state) => omit(["open"], state),
      version: 5,
    },
  ),
)
