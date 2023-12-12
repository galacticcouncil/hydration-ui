import { WalletProviderType } from "sections/web3-connect/Web3Connect.utils"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { omit } from "utils/rx"

export enum WalletProviderStatus {
  Connected = "connected",
  Pending = "pending",
  Disconnected = "disconnected",
  Error = "error",
}

export type Account = {
  name: string
  address: string
  evmAddress?: string
  provider: WalletProviderType
  isExternalWalletConnected?: boolean
  delegate?: string
}

type WalletProviderState = {
  open: boolean
  provider: WalletProviderType | null
  account: Account | null
  status: WalletProviderStatus
  error?: string
}

type WalletProviderStore = WalletProviderState & {
  toggle: () => void
  setAccount: (account: Account | null) => void
  setProvider: (provider: WalletProviderType | null) => void
  setStatus: (
    provider: WalletProviderType | null,
    status: WalletProviderStatus,
  ) => void
  setError: (error: string) => void
  disconnect: () => void
}

const initialState: WalletProviderState = {
  open: false,
  provider: null,
  account: null,
  status: WalletProviderStatus.Disconnected,
  error: "",
}

export const useWeb3ConnectStore = create<WalletProviderStore>()(
  persist(
    (set) => ({
      ...initialState,
      toggle: () => set((state) => ({ ...state, open: !state.open })),
      setAccount: (account) => set((state) => ({ ...state, account })),
      setProvider: (provider) => set((state) => ({ ...state, provider })),
      setStatus: (provider, status) => {
        const isConnected = status === WalletProviderStatus.Connected
        const isError = status === WalletProviderStatus.Error
        return set((state) => ({
          ...state,
          provider,
          status,
          account: isConnected ? state.account : null,
          error: isError ? state.error : "",
        }))
      },
      setError: (error) => set((state) => ({ ...state, error })),
      disconnect: () => {
        set((state) => ({ ...state, ...initialState, open: state.open }))
      },
    }),
    {
      name: "web3-connect",
      partialize: (state) => omit(["open"], state),
    },
  ),
)
