import { parseIndexerUrlName } from "@galacticcouncil/indexer/squid/lib/parseIndexerUrlName"
import { omit } from "remeda"
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

type SquidListStore = {
  squidList: Array<{
    name?: string
    url: string
  }>
  addSquid: (url: string) => void
  removeSquid: (url: string) => void
  renameSquid: (url: string, newName: string) => void
}

export const useSquidListStore = create<SquidListStore>()(
  persist(
    (set) => ({
      squidList: [],
      addSquid: (url) =>
        set((store) => ({
          squidList: [
            ...store.squidList,
            { url, name: parseIndexerUrlName(url) },
          ],
        })),
      removeSquid: (urlToRemove) =>
        set((store) => ({
          squidList: store.squidList.filter(
            (squid) => squid.url !== urlToRemove,
          ),
        })),
      renameSquid: (urlToRename, name) =>
        set((store) => ({
          squidList: store.squidList.map((squid) =>
            squid.url === urlToRename ? { ...squid, name } : squid,
          ),
        })),
    }),
    {
      name: "squidList",
    },
  ),
)

type ProviderRpcUrlStoreState = {
  rpcUrl: string
  squidUrl: string
  rpcUrlList: string[]
  updatedAt: number
  autoMode: boolean
}

type ProviderRpcUrlStore = ProviderRpcUrlStoreState & {
  setRpcUrl: (rpcUrl: string | undefined) => void
  setSquidUrl: (squidUrl: string | undefined) => void
  setRpcUrlList: (rpcUrlList: string[], updatedAt: number) => void
  getDataEnv: () => TDataEnv
  setAutoMode: (state: boolean) => void
}

export const useProviderRpcUrlStore = create<ProviderRpcUrlStore>()(
  persist(
    (set, get) => ({
      rpcUrl: import.meta.env.VITE_PROVIDER_URL,
      squidUrl: import.meta.env.VITE_SQUID_URL,
      rpcUrlList: [],
      updatedAt: 0,
      autoMode: true,
      setRpcUrl: (rpcUrl) => set({ rpcUrl }),
      setSquidUrl: (squidUrl) => set({ squidUrl }),
      setRpcUrlList: (rpcUrlList, updatedAt) => set({ rpcUrlList, updatedAt }),
      setAutoMode: (state) => set({ autoMode: state }),
      getDataEnv: () => {
        const { rpcUrl } = get()
        return getProviderDataEnv(rpcUrl)
      },
    }),
    {
      name: "rpcUrl",
      version: 2.7,
      partialize: omit(["rpcUrlList"]),
    },
  ),
)
