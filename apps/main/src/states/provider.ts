import { create } from "zustand"
import { persist } from "zustand/middleware"

import { getProviderDataEnv } from "@/api/provider"
import { TDataEnv } from "@/config/rpc"

type RpcListStore = {
  rpcList: Array<{
    name?: string
    url: string
  }>
  addRpc: (account: string) => void
  removeRpc: (url: string) => void
  renameRpc: (url: string, newName: string) => void
}

export const useRpcListStore = create<RpcListStore>()(
  persist(
    (set) => ({
      rpcList: [],
      addRpc: (url) =>
        set((store) => ({ rpcList: [...store.rpcList, { url }] })),
      removeRpc: (urlToRemove) =>
        set((store) => ({
          rpcList: store.rpcList.filter((rpc) => rpc.url !== urlToRemove),
        })),
      renameRpc: (urlToRename, name) =>
        set((store) => ({
          rpcList: store.rpcList.map((rpc) =>
            rpc.url === urlToRename ? { ...rpc, name } : rpc,
          ),
        })),
    }),
    {
      name: "rpcList",
    },
  ),
)

export const useProviderRpcUrlStore = create(
  persist<{
    rpcUrl: string
    rpcUrlList: string[]
    autoMode: boolean
    updatedAt: number
    setRpcUrl: (rpcUrl: string | undefined) => void
    setRpcUrlList: (rpcUrlList: string[], updatedAt: number) => void
    getDataEnv: () => TDataEnv
    setAutoMode: (state: boolean) => void
  }>(
    (set, get) => ({
      rpcUrl: import.meta.env.VITE_PROVIDER_URL,
      rpcUrlList: [],
      updatedAt: 0,
      autoMode: true,
      setRpcUrl: (rpcUrl) => set({ rpcUrl }),
      setRpcUrlList: (rpcUrlList, updatedAt) => set({ rpcUrlList, updatedAt }),
      setAutoMode: (state) => set({ autoMode: state }),
      getDataEnv: () => {
        const { rpcUrl } = get()
        return getProviderDataEnv(rpcUrl)
      },
    }),
    {
      name: "rpcUrl",
      version: 2.2,
    },
  ),
)
