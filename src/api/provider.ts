import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { ApiPromise, WsProvider } from "@polkadot/api"
import * as definitions from "interfaces/voting/definitions"
import create from "zustand"
import { persist } from "zustand/middleware"

export const PROVIDERS = [
  {
    name: "Mainnet via GC",
    url: "wss://rpc.hydradx.cloud",
    indexerUrl: "https://hydradx-explorer.play.hydration.cloud/graphql",
  },
  {
    name: "Mainnet via Dwellir",
    url: "wss://hydradx-rpc.dwellir.com",
    indexerUrl: "https://hydradx-explorer.play.hydration.cloud/graphql",
  },
  {
    name: "Mainnet via ZeePrime",
    url: "wss://rpc-lb.data6.zp-labs.net:8443/hydradx/ws/?token=2ZGuGivPJJAxXiT1hR1Yg2MXGjMrhEBYFjgbdPi",
    indexerUrl: "https://hydradx-explorer.play.hydration.cloud/graphql",
  },
  {
    name: "Rococo via GC",
    url: "wss://hydradx-rococo-rpc.play.hydration.cloud",
    indexerUrl: "https://hydradx-rococo-explorer.play.hydration.cloud/graphql",
  },
  {
    name: "Testnet",
    url: "wss://mining-rpc.hydradx.io",
    indexerUrl: "https://hydradx-rococo-explorer.play.hydration.cloud/graphql",
  },
]

export const useProviderRpcUrlStore = create(
  persist<{
    rpcUrl?: string
    setRpcUrl: (rpcUrl: string | undefined) => void
    _hasHydrated: boolean
    _setHasHydrated: (value: boolean) => void
  }>(
    (set) => ({
      setRpcUrl: (rpcUrl) => set({ rpcUrl }),
      _hasHydrated: false,
      _setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "rpcUrl",
      getStorage: () => ({
        async getItem(name: string) {
          return window.localStorage.getItem(name)
        },
        setItem(name, value) {
          window.localStorage.setItem(name, value)
        },
        removeItem(name) {
          window.localStorage.removeItem(name)
        },
      }),
      onRehydrateStorage: () => (state) => {
        state?._setHasHydrated(true)
      },
    },
  ),
)

export const useProvider = (rpcUrl?: string) => {
  return useQuery(
    QUERY_KEYS.provider(rpcUrl ?? import.meta.env.VITE_PROVIDER_URL),
    async ({ queryKey: [_, api] }) => {
      const provider = new WsProvider(api)
      const types = Object.values(definitions).reduce(
        (res, { types }): object => ({ ...res, ...types }),
        {},
      )
      return await ApiPromise.create({ provider, types })
    },
    { staleTime: Infinity },
  )
}
