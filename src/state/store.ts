import { create } from "zustand"
import { StateStorage, createJSONStorage, persist } from "zustand/middleware"
import { SubmittableExtrinsic } from "@polkadot/api/promise/types"
import { ISubmittableResult } from "@polkadot/types/types"
import { v4 as uuid } from "uuid"
import { ReactElement } from "react"
import BigNumber from "bignumber.js"
import { StepProps } from "components/Stepper/Stepper"
import { TransactionRequest } from "@ethersproject/providers"
import { Call, SubstrateCall } from "@galacticcouncil/xcm-sdk"
import { arraysEqual } from "utils/helpers"
import { Asset } from "@galacticcouncil/sdk"
import { TExternalAsset } from "sections/wallet/addToken/AddToken.utils"
import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { Parachain } from "@galacticcouncil/xcm-core"
import { TradeMetadata, TxType, XcmMetadata } from "@galacticcouncil/apps"

export interface ToastMessage {
  onLoading?: ReactElement
  onSuccess?: ReactElement
  onError?: ReactElement
}

export interface Account {
  name: string
  address: string
  provider: string
  isExternalWalletConnected: boolean
  delegate?: string
}

export interface TransactionInput {
  title?: string
  description?: string
  tx?: SubmittableExtrinsic | TxType
  txOptions?: SubstrateCall["txOptions"]
  txMeta?: TradeMetadata
  evmTx?: {
    data: TransactionRequest
    abi?: string
  }
  xcall?: Call
  xcallMeta?: XcmMetadata
  overrides?: {
    fee: BigNumber
    currencyId?: string
    feeExtra?: BigNumber
  }
}

export interface Transaction extends TransactionInput {
  id: string
  onSuccess?: (result: ISubmittableResult) => void
  onSubmitted?: () => void
  onError?: () => void
  toast?: ToastMessage
  isProxy: boolean
  steps?: Array<StepProps>
  onBack?: () => void
  onClose?: () => void
  disableAutoClose?: boolean
}

export type TransactionOptions = {
  onSuccess?: (result: ISubmittableResult) => void
  onSubmitted?: () => void
  toast?: ToastMessage
  isProxy?: boolean
  steps?: Array<StepProps>
  onBack?: () => void
  onClose?: () => void
  onError?: () => void
  disableAutoClose?: boolean
  rejectOnClose?: boolean
}

interface Store {
  transactions?: Transaction[]
  createTransaction: (
    transaction: TransactionInput,
    options?: TransactionOptions,
  ) => Promise<ISubmittableResult>
  cancelTransaction: (hash: string) => void
  clearTransactions: () => void
}

type RpcStore = {
  rpcList: Array<{
    name?: string
    url: string
  }>
  addRpc: (account: string) => void
  removeRpc: (url: string) => void
  renameRpc: (url: string, newName: string) => void
}

export const useStore = create<Store>((set) => ({
  createTransaction: (transaction, options) => {
    return new Promise<ISubmittableResult>((resolve, reject) => {
      set((store) => {
        return {
          transactions: [
            {
              ...transaction,
              id: uuid(),
              toast: options?.toast,
              onSubmitted: () => {
                options?.onSubmitted?.()
              },
              onSuccess: (value) => {
                resolve(value)
                options?.onSuccess?.(value)
              },
              onError: () => {
                options?.onError?.()
                reject(new Error("Transaction rejected"))
              },
              isProxy: !!options?.isProxy,
              steps: options?.steps,
              onBack: options?.onBack,
              onClose: () => {
                if (options?.rejectOnClose) {
                  reject(new Error("Transaction closed"))
                }
                options?.onClose?.()
              },
              disableAutoClose: options?.disableAutoClose,
            },
            ...(store.transactions ?? []),
          ],
        }
      })
    })
  },
  cancelTransaction: (id) => {
    set((store) => ({
      transactions: store.transactions?.filter(
        (transaction) => transaction.id !== id,
      ),
    }))
  },
  clearTransactions: () =>
    set(() => ({
      transactions: [],
    })),
}))

export const useRpcStore = create<RpcStore>()(
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
      name: "hydradx-rpc-list",
    },
  ),
)

export type TAssetStored = Asset & {
  isTradable: boolean
  externalId: string | undefined
}

export type TShareTokenStored = {
  poolAddress: string
  assets: string[]
  shareTokenId: string
}

type AssetRegistryStore = {
  assets: Array<TAssetStored>
  shareTokens: Array<TShareTokenStored>
  sync: (assets: TAssetStored[]) => void
  syncShareTokens: (shareTokens: TShareTokenStored[]) => void
}

export enum IndexedDBStores {
  Assets = "assets",
  ApiMetadata = "apiMetadata",
}

const db: IDBDatabase | null = await new Promise((resolve) => {
  const request = indexedDB.open("storage", 2)

  request.onsuccess = () => resolve(request.result)

  request.onupgradeneeded = () => {
    const db = request.result

    if (!db.objectStoreNames.contains(IndexedDBStores.Assets)) {
      db.createObjectStore(IndexedDBStores.Assets, { keyPath: "key" })
    }

    if (!db.objectStoreNames.contains(IndexedDBStores.ApiMetadata)) {
      db.createObjectStore(IndexedDBStores.ApiMetadata, { keyPath: "key" })
    }
  }

  request.onerror = () => resolve(null)
})

const getItems = async (
  db: IDBDatabase,
  key: IndexedDBStores,
): Promise<Array<{ key: string; data: object[] }>> =>
  await new Promise((resolve) => {
    const tx = db.transaction(key, "readonly")
    const store = tx.objectStore(key)
    const res = store.getAll()

    res.onsuccess = () => {
      const data = res.result

      resolve(data)
    }
  })

const setItems = async (
  db: IDBDatabase,
  key: IndexedDBStores,
  data: { key: string; data: any },
) =>
  await new Promise((resolve) => {
    const tx = db.transaction(key, "readwrite")
    const store = tx.objectStore(key)

    store.put(data)

    resolve(data)
  })

const storage: StateStorage = {
  getItem: async () => {
    const storage = await db
    if (!storage) return null

    const data = await getItems(storage, IndexedDBStores.Assets)

    const tokens = data.find((e) => e.key === "tokens")?.data ?? []
    const shareTokens = data.find((e) => e.key === "shareTokens")?.data ?? []

    return JSON.stringify({
      version: 0,
      state: { assets: tokens, shareTokens },
    })
  },
  setItem: async (_, value) => {
    const parsedState = JSON.parse(value)
    const storage = await db

    if (storage) {
      setItems(storage, IndexedDBStores.Assets, {
        key: "tokens",
        data: parsedState.state.assets,
      })

      setItems(storage, IndexedDBStores.Assets, {
        key: "shareTokens",
        data: parsedState.state.shareTokens,
      })
    }
  },
  removeItem: () => {},
}

export const useAssetRegistry = create<AssetRegistryStore>()(
  persist(
    (set, get) => ({
      assets: [],
      shareTokens: [],
      sync(assets) {
        const storedAssets = get().assets

        const areTokensEqual = arraysEqual(storedAssets, assets)

        if (!areTokensEqual) {
          set({
            assets,
          })
        }
      },
      syncShareTokens(shareTokens) {
        const storedShareTokens = get().shareTokens

        const areShareTokensEqual = arraysEqual(storedShareTokens, shareTokens)

        if (!areShareTokensEqual) {
          set({
            shareTokens,
          })
        }
      },
    }),
    {
      name: "asset-registry",
      storage: createJSONStorage(() => storage),
    },
  ),
)

type ExternalMetadataStore = {
  chains: Record<string, TExternalAsset[]>
  chainsMap: Record<string, Map<string, TExternalAsset>>
  isInitialized: boolean
  sync: (chainId: string, assets: TExternalAsset[]) => void
  getExternalAssetMetadata: (
    chainId: string,
    assetId: string,
  ) => TExternalAsset | undefined
}

export const useExternalAssetsMetadata = create<ExternalMetadataStore>(
  (set, get) => ({
    chains: {},
    chainsMap: {},
    isInitialized: false,
    sync(chainId, assets) {
      set((state) => {
        const newChains = { ...state.chains, [chainId]: assets }
        const isInitialized =
          !!newChains[(chainsMap.get("assethub") as Parachain).parachainId] &&
          !!newChains[(chainsMap.get("pendulum") as Parachain).parachainId]

        return {
          chains: newChains,
          isInitialized,
          chainsMap: {
            ...state.chainsMap,
            [chainId]: new Map(assets.map((asset) => [asset.id, asset])),
          },
        }
      })
    },
    getExternalAssetMetadata(chainId, assetId) {
      return get().chainsMap[chainId]?.get(assetId)
    },
  }),
)

type SettingsStore = {
  degenMode: boolean
  toggleDegenMode: () => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      degenMode: false,
      toggleDegenMode: () => set((store) => ({ degenMode: !store.degenMode })),
    }),
    {
      name: "settings",
      version: 1,
    },
  ),
)

const metadataStorage: StateStorage = {
  getItem: async () => {
    const storage = await db
    if (!storage) return null

    const data = await getItems(storage, IndexedDBStores.ApiMetadata)

    return JSON.stringify({
      version: 0,
      state: {
        metadata: data.length ? { [data[0].key]: data[0].data } : undefined,
      },
    })
  },
  setItem: async (_, value) => {
    const parsedState = JSON.parse(value)
    const metadata = parsedState.state?.metadata as object
    const storage = await db

    if (storage && metadata) {
      const data = await getItems(storage, IndexedDBStores.ApiMetadata)

      const isStored = data.some((el) => metadata.hasOwnProperty(el.key))

      if (!isStored) {
        const transaction = storage.transaction(
          IndexedDBStores.ApiMetadata,
          "readwrite",
        )
        const store = transaction.objectStore(IndexedDBStores.ApiMetadata)

        // clear previous metadata
        store.clear()

        Object.entries(metadata).forEach(([key, data]) => {
          setItems(storage, IndexedDBStores.ApiMetadata, {
            key,
            data,
          })
        })
      }
    }
  },
  removeItem: () => {},
}

export const useApiMetadata = create(
  persist<{
    metadata: Record<string, `0x${string}`> | undefined
    setMetadata: (specVersion: string, metadata: `0x${string}`) => void
  }>(
    (set) => ({
      metadata: {},
      setMetadata: (specVersion, metadata) => {
        set((state) => ({
          ...state,
          metadata: { [specVersion]: metadata },
        }))
      },
    }),
    { name: "api-metadata", storage: createJSONStorage(() => metadataStorage) },
  ),
)

export const useValidXYKPoolAddresses = create<{ addresses?: string[] }>(
  () => ({
    addresses: undefined,
  }),
)

export const setValidXYKPoolAddresses = (addresses: string[]) =>
  useValidXYKPoolAddresses.setState({ addresses })

export const useOmnipoolTvlTotal = create<{ tvl?: string }>(() => ({
  tvl: undefined,
}))

export const setOmnipoolTvlTotal = (tvl?: string) =>
  useOmnipoolTvlTotal.setState({ tvl })

export const useStablepoolTvlTotal = create<{ tvl?: string }>(() => ({
  tvl: undefined,
}))

export const setStablepoolTvlTotal = (tvl?: string) =>
  useStablepoolTvlTotal.setState({ tvl })

export const useOmnipoolVolumeTotal = create<{ volume?: string }>(() => ({
  volume: undefined,
}))

export const setOmnipoolVolumeTotal = (volume?: string) =>
  useOmnipoolVolumeTotal.setState({ volume })

export const useXykTvlTotal = create<{ tvl?: string }>(() => ({
  tvl: undefined,
}))

export const setXykTvlTotal = (tvl?: string) => useXykTvlTotal.setState({ tvl })

export const useXykVolumeTotal = create<{ volume?: string }>(() => ({
  volume: undefined,
}))

export const setXykVolumeTotal = (volume?: string) =>
  useXykVolumeTotal.setState({ volume })
