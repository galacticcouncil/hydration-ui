import { create } from "zustand"
import { persist } from "zustand/middleware"

import { TEnv } from "@/api/provider"
import { PROVIDERS } from "@/config/rpc"

export const useProviderRpcUrlStore = create(
  persist<{
    rpcUrl: string
    autoMode: boolean
    setRpcUrl: (rpcUrl: string | undefined) => void
    getDataEnv: () => TEnv
    setAutoMode: (state: boolean) => void
    _hasHydrated: boolean
    _setHasHydrated: (value: boolean) => void
  }>(
    (set, get) => ({
      rpcUrl: import.meta.env.VITE_PROVIDER_URL,
      autoMode: true,
      setRpcUrl: (rpcUrl) => set({ rpcUrl }),
      setAutoMode: (state) => set({ autoMode: state }),
      getDataEnv: () => {
        const { rpcUrl } = get()

        return (
          PROVIDERS.find((provider) => provider.url === rpcUrl)?.dataEnv ??
          "mainnet"
        )
      },
      _hasHydrated: false,
      _setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "rpcUrl",
      version: 2.1,
      onRehydrateStorage: () => (state) => {
        state?._setHasHydrated(true)
      },
    },
  ),
)
